import fs from 'fs';
import path from 'path';
import pptxgen from 'pptxgenjs';
import type { SlideDeck } from '@mindfiredigital/mdslide-shared';
import { PPTX_THEMES } from '../constants/exports/pptxConstants.js';
import {
  nodeToPlainText,
  nodeToTextProps,
  findImagesInNodes,
  resolveImagePath,
  extractFlatListLines,
  pushParagraphNodeToRuns,
  pushListLinesToRuns,
} from './helper/pptxEditableSlideHelper.js';

export async function compileToEditablePptx(
  deck: SlideDeck,
  outputPath: string,
  options: { theme?: string; baseDir?: string } = {}
): Promise<void> {
  const pptx = new (pptxgen as any)();
  pptx.layout = 'LAYOUT_16x9';

  const themeName = options.theme ?? String(deck.meta?.theme ?? 'light');
  const theme = PPTX_THEMES[themeName] || PPTX_THEMES.light;
  const baseDir = options.baseDir;

  for (const slide of deck.slides) {
    const pptxSlide = pptx.addSlide();

    // Set background color matching the selected theme
    pptxSlide.background = { fill: theme.bg };

    // Main Title
    if (slide.title && slide.type !== 'title' && slide.type !== 'statement') {
      pptxSlide.addText(slide.title, {
        x: 0.8,
        y: 0.4,
        w: 8.4,
        h: 0.8,
        fontSize: 26,
        bold: true,
        fontFace: theme.font,
        color: theme.accent,
        valign: 'middle',
      });
    }

    // Render slide contents based on layout type
    if (slide.type === 'title') {
      // Large centered title layout
      pptxSlide.addText(slide.title || 'Title', {
        x: 0.8,
        y: 1.8,
        w: 8.4,
        h: 1.2,
        align: 'center',
        fontSize: 44,
        bold: true,
        fontFace: theme.font,
        color: theme.accent,
      });

      if (slide.content && slide.content.length > 0) {
        const textRuns: any[] = [];
        slide.content.forEach((node, nodeIdx) => {
          const isLastNode = nodeIdx === slide.content.length - 1;
          pushParagraphNodeToRuns(node, textRuns, theme, 20, isLastNode);
        });

        if (textRuns.length > 0) {
          pptxSlide.addText(textRuns, {
            x: 0.8,
            y: 3.2,
            w: 8.4,
            h: 1.5,
            align: 'center',
          });
        }
      }
    } else if (slide.type === 'statement') {
      // Large statement layout
      const textRuns: any[] = [];
      if (slide.title) {
        textRuns.push({
          text: slide.title + '\n\n',
          options: { bold: true, fontSize: 32, color: theme.accent, fontFace: theme.font },
        });
      }
      slide.content.forEach((node, nodeIdx) => {
        const isLastNode = nodeIdx === slide.content.length - 1;
        pushParagraphNodeToRuns(node, textRuns, theme, 24, isLastNode);
      });

      pptxSlide.addText(textRuns, {
        x: 0.8,
        y: 1.2,
        w: 8.4,
        h: 3.4,
        align: 'center',
        valign: 'middle',
      });
    } else if (slide.type === 'quote') {
      // Blockquote card layout
      const quoteText: any[] = [];
      const quoteNode = slide.content.find((n) => n.type === 'blockquote');

      const nodesToRender = quoteNode && quoteNode.children ? quoteNode.children : slide.content;
      nodesToRender.forEach((node, nodeIdx) => {
        const isLastNode = nodeIdx === nodesToRender.length - 1;
        const runs = nodeToTextProps(node, theme);
        runs.forEach((run, runIdx) => {
          const isLastRun = runIdx === runs.length - 1;
          const runOptions: any = {
            ...run.options,
            fontSize: 18,
            italic: true,
            fontFace: theme.font,
            color: theme.text,
          };
          if (isLastRun && !isLastNode) {
            runOptions.breakLine = true;
          }
          quoteText.push({ text: run.text, options: runOptions });
        });
      });

      pptxSlide.addText(quoteText, {
        x: 1.0,
        y: 1.4,
        w: 8.0,
        h: 3.2,
        valign: 'middle',
        fill: { color: theme.cardBg },
        line: { color: theme.accent, width: 2 },
        margin: 20,
      });
    } else if (slide.type === 'code') {
      // Code box container layout
      const codeNode = slide.content.find((n) => n.type === 'code');
      const codeVal = codeNode?.value || '';

      pptxSlide.addText(codeVal, {
        x: 0.8,
        y: 1.3,
        w: 8.4,
        h: 3.8,
        fontSize: 10,
        fontFace: 'Courier New',
        color: theme.text,
        valign: 'top',
        fill: { color: theme.cardBg },
        line: { color: theme.accent, width: 1 },
        margin: 15,
      });
    } else if (slide.type === 'visual') {
      // Large centered image layout
      let imgUrl = '';
      slide.content.forEach((node) => {
        if (node.type === 'image') {
          imgUrl = node.url || '';
        } else if (node.children) {
          node.children.forEach((c) => {
            if (c.type === 'image') imgUrl = c.url || '';
          });
        }
      });

      if (imgUrl) {
        const hasTitle = !!slide.title;
        pptxSlide.addImage({
          path: resolveImagePath(imgUrl, baseDir),
          x: 1.0,
          y: hasTitle ? 1.2 : 0.5,
          w: 8.0,
          h: hasTitle ? 4.0 : 4.6,
        });
      } else {
        const textRuns: any[] = [];
        slide.content.forEach((node, nodeIdx) => {
          const isLastNode = nodeIdx === slide.content.length - 1;
          pushParagraphNodeToRuns(node, textRuns, theme, 16, isLastNode);
        });

        pptxSlide.addText(textRuns, {
          x: 0.8,
          y: 1.4,
          w: 8.4,
          h: 3.6,
          valign: 'top',
        });
      }
    } else if (slide.type === 'table') {
      // Tabular comparison grid layout
      const tableNode = slide.content.find((n) => n.type === 'table');
      if (tableNode && tableNode.children) {
        const rows: any[] = [];
        tableNode.children.forEach((rowNode) => {
          const cells: any[] = [];
          if (rowNode.children) {
            rowNode.children.forEach((cellNode) => {
              const cellText = cellNode.children
                ? cellNode.children.map(nodeToPlainText).join('')
                : cellNode.value || '';
              cells.push({
                text: cellText,
                options: {
                  fill: cellNode.header ? { color: theme.accent } : { color: theme.cardBg },
                  color: cellNode.header ? theme.bg : theme.text,
                  bold: cellNode.header,
                  fontFace: theme.font,
                  fontSize: 12,
                },
              });
            });
          }
          rows.push(cells);
        });

        pptxSlide.addTable(rows, {
          x: 0.8,
          y: 1.4,
          w: 8.4,
          h: 3.6,
        });
      }
    } else if (slide.type === 'split') {
      // Split layout
      const leftCol = slide.content[0];
      const rightCol = slide.content[1];

      // Left column
      if (leftCol && leftCol.type === 'column' && leftCol.children) {
        const leftRuns: any[] = [];
        leftCol.children.forEach((node, nodeIdx) => {
          const isLastNode = nodeIdx === (leftCol.children?.length ?? 0) - 1;
          if (node.type === 'list') {
            const listLines = extractFlatListLines(node, theme);
            pushListLinesToRuns(listLines, leftRuns, theme, 14, isLastNode);
          } else {
            pushParagraphNodeToRuns(node, leftRuns, theme, 14, isLastNode);
          }
        });

        if (leftRuns.length > 0) {
          pptxSlide.addText(leftRuns, {
            x: 0.8,
            y: 1.4,
            w: 3.9,
            h: 3.6,
            valign: 'top',
          });
        }
      }

      // Right column
      if (rightCol && rightCol.type === 'column' && rightCol.children) {
        const rightChild = rightCol.children[0];

        if (rightChild && rightChild.type === 'image') {
          pptxSlide.addImage({
            path: resolveImagePath(rightChild.url || '', baseDir),
            x: 5.0,
            y: 1.4,
            w: 4.2,
            h: 3.6,
          });
        } else if (rightChild && rightChild.type === 'code') {
          pptxSlide.addText(rightChild.value || '', {
            x: 5.0,
            y: 1.4,
            w: 4.2,
            h: 3.6,
            fontSize: 9.5,
            fontFace: 'Courier New',
            color: theme.text,
            valign: 'top',
            fill: { color: theme.cardBg },
            line: { color: theme.accent, width: 1 },
            margin: 12,
          });
        } else {
          const rightRuns: any[] = [];
          rightCol.children.forEach((node, nodeIdx) => {
            const isLastNode = nodeIdx === (rightCol.children?.length ?? 0) - 1;
            pushParagraphNodeToRuns(node, rightRuns, theme, 14, isLastNode);
          });

          if (rightRuns.length > 0) {
            pptxSlide.addText(rightRuns, {
              x: 5.0,
              y: 1.4,
              w: 4.2,
              h: 3.6,
              valign: 'top',
            });
          }
        }
      }
    } else {
      // Default bullets/content layout
      const allTextRuns: any[] = [];
      const imageUrls = findImagesInNodes(slide.content);

      slide.content.forEach((node, nodeIdx) => {
        const isLastNode = nodeIdx === slide.content.length - 1;
        if (node.type === 'list') {
          const listLines = extractFlatListLines(node, theme);
          pushListLinesToRuns(listLines, allTextRuns, theme, 16, isLastNode);
        } else {
          pushParagraphNodeToRuns(node, allTextRuns, theme, 16, isLastNode);
        }
      });

      const hasImages = imageUrls.length > 0;
      const textHeight = hasImages ? 2.0 : 3.8;

      if (allTextRuns.length > 0) {
        pptxSlide.addText(allTextRuns, {
          x: 0.8,
          y: 1.3,
          w: 8.4,
          h: textHeight,
          valign: 'top',
        });
      }

      if (hasImages) {
        const N = imageUrls.length;
        const gap = 0.3;
        const totalWidth = 8.4;
        const imageY = 3.5;
        const imageHeight = 1.7;

        if (N === 1) {
          const imgWidth = 4.5;
          const imgX = 0.8 + (totalWidth - imgWidth) / 2;
          pptxSlide.addImage({
            path: resolveImagePath(imageUrls[0]!, baseDir),
            x: imgX,
            y: imageY,
            w: imgWidth,
            h: imageHeight,
          });
        } else {
          const imgWidth = (totalWidth - gap * (N - 1)) / N;
          imageUrls.forEach((url, i) => {
            const imgX = 0.8 + i * (imgWidth + gap);
            pptxSlide.addImage({
              path: resolveImagePath(url, baseDir),
              x: imgX,
              y: imageY,
              w: imgWidth,
              h: imageHeight,
            });
          });
        }
      }
    }
  }

  // Write output file, creating any missing parent directories first
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  await pptx.writeFile({ fileName: path.resolve(outputPath) });
}
