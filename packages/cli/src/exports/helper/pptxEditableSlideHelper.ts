import type { SlideDeck, SlideNode } from '@mindfiredigital/mdslide-shared';
import { FlatListLine, PptxTheme } from '../../types/index.js';
import { BULLET_CHARS } from '../../constants/exports/pptxConstants.js';
import path from 'path';

// Recursively extract text from SlideNode into pptx array
function nodeToTextProps(node: SlideNode, theme: PptxTheme): any[] {
  const props: any[] = [];

  const fontOptions = {
    fontFace: theme.font,
    color: theme.text,
  };

  if (node.type === 'text') {
    props.push({
      text: node.value || '',
      options: { ...fontOptions },
    });
  } else if (node.type === 'strong') {
    if (node.children) {
      node.children.forEach((c) => {
        const childProps = nodeToTextProps(c, theme);
        childProps.forEach((cp) => {
          cp.options = { ...cp.options, bold: true };
          props.push(cp);
        });
      });
    }
  } else if (node.type === 'emphasis') {
    if (node.children) {
      node.children.forEach((c) => {
        const childProps = nodeToTextProps(c, theme);
        childProps.forEach((cp) => {
          cp.options = { ...cp.options, italic: true };
          props.push(cp);
        });
      });
    }
  } else if (node.type === 'inlineCode') {
    props.push({
      text: node.value || '',
      options: {
        ...fontOptions,
        fontFace: 'Courier New',
        color: theme.accent,
      },
    });
  } else if (node.type === 'link') {
    const textVal = node.children
      ? node.children.map((c) => c.value || '').join('')
      : node.value || 'Link';
    props.push({
      text: textVal,
      options: {
        ...fontOptions,
        color: theme.accent,
        hyperlink: { url: node.url || '' },
      },
    });
  } else if (node.children) {
    node.children.forEach((c) => {
      props.push(...nodeToTextProps(c, theme));
    });
  }

  return props;
}

// Recursively extract text from SlideNode into a plain string
function nodeToPlainText(node: SlideNode): string {
  if (node.value) return node.value;
  if (node.children) {
    return node.children.map(nodeToPlainText).join('');
  }
  return '';
}

// Recursively find all image URLs inside a slide
function findImagesInNodes(nodes: SlideNode[]): string[] {
  const urls: string[] = [];
  function traverse(n: SlideNode) {
    if (n.type === 'image' && n.url) {
      urls.push(n.url);
    }
    if (n.children) {
      n.children.forEach(traverse);
    }
  }
  nodes.forEach(traverse);
  return urls;
}

// Resolve image path relative to markdown baseDir if it is a local file
function resolveImagePath(imgUrl: string, baseDir?: string): string {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    return imgUrl;
  }
  if (path.isAbsolute(imgUrl)) {
    return imgUrl;
  }
  if (baseDir) {
    return path.resolve(baseDir, imgUrl);
  }
  return path.resolve(imgUrl);
}

function getBulletCharCode(indent: number): string {
  return BULLET_CHARS[indent] ?? BULLET_CHARS[2];
}

// Font size shrinks slightly at deeper indent levels, floored at 10pt
function getBulletFontSize(baseFontSize: number, indent: number): number {
  return Math.max(baseFontSize - indent * 1.5, 10);
}

function extractFlatListLines(node: SlideNode, theme: PptxTheme, indent = 0): FlatListLine[] {
  const lines: FlatListLine[] = [];

  if (node.type === 'list') {
    if (node.children) {
      node.children.forEach((item) => {
        if (item.type === 'listItem' && item.children) {
          const itemText: any[] = [];
          const nestedLists: SlideNode[] = [];

          item.children.forEach((c) => {
            if (c.type === 'list') {
              nestedLists.push(c);
            } else {
              itemText.push(...nodeToTextProps(c, theme));
            }
          });

          if (itemText.length > 0) {
            lines.push({ text: itemText, bullet: true, indent });
          }

          nestedLists.forEach((l) => {
            lines.push(...extractFlatListLines(l, theme, indent + 1));
          });
        }
      });
    }
  }

  return lines;
}

function pushParagraphNodeToRuns(
  node: SlideNode,
  runsArray: any[],
  theme: PptxTheme,
  fontSize: number,
  isLastNode: boolean
) {
  const runs = nodeToTextProps(node, theme);
  runs.forEach((run, runIdx) => {
    const isLastRun = runIdx === runs.length - 1;
    const runOptions: any = {
      ...run.options,
      fontSize,
      fontFace: theme.font,
      color: theme.text,
    };
    if (isLastRun && !isLastNode) {
      runOptions.breakLine = true;
    }
    runsArray.push({ text: run.text, options: runOptions });
  });
}

function pushListLinesToRuns(
  listLines: FlatListLine[],
  runsArray: any[],
  theme: PptxTheme,
  baseFontSize: number,
  _isLastNode: boolean
) {
  listLines.forEach((line) => {
    if (line.text.length === 0) return;

    const fontSize = getBulletFontSize(baseFontSize, line.indent);

    line.text.forEach((run, runIdx) => {
      const isFirstRun = runIdx === 0;

      const runOptions: any = {
        ...run.options,
        fontSize,
        fontFace: theme.font,
        color: theme.text,
      };

      if (isFirstRun) {
        // bullet + indentLevel only on the first run   this triggers a new
        // paragraph in pptxgenjs and sets the indent for the whole line
        runOptions.bullet = { characterCode: getBulletCharCode(line.indent) };
        runOptions.indentLevel = line.indent;
      }
      // no breakLine on any bullet run   pptxgenjs handles paragraph breaks
      // automatically when it sees `bullet` on the next line's first run

      runsArray.push({ text: run.text, options: runOptions });
    });
  });
}

export {
  nodeToPlainText,
  nodeToTextProps,
  findImagesInNodes,
  resolveImagePath,
  extractFlatListLines,
  pushParagraphNodeToRuns,
  pushListLinesToRuns,
};
