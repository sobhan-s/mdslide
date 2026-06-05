import { parseMarkdown } from '../src/parser/markdownParser.ts';
import { normalizeSlides } from '../src/normalizer/mdAstToSlideBasedAst.ts';

const markdown = `---
title: Notion Slide
theme: notion
---

# Introduction to mdslide
This is our brand new compiler core.
<!-- notes -->
This is a speaker note for slide 1.
<!-- /notes -->

---

## What is a Slide?
<!-- layout: bullets -->
- Bullet 1
- Bullet 2

<!-- notes -->
Make sure to explain layout overrides.
<!-- /notes -->
`;

console.log('STEP 1: RAW MDAST PARSER OUTPUT (BEFORE NORMALIZATION)');

const parseResult = parseMarkdown(markdown);

parseResult.slides.forEach((rawSlide, index) => {
  console.log(`\n--- [ RAW SLIDE BLOCK ${index + 1} ] ---`);
  console.log(`ID: ${rawSlide.id}`);
  console.log(`Raw Nodes Structure:`);
  console.log(JSON.stringify(rawSlide.nodes, null, 2));
});

console.log('STEP 2: SLIDE-BASED AST OUTPUT (AFTER NORMALIZATION / RESOLVING)');

const normalizedSlides = normalizeSlides(parseResult.slides);

normalizedSlides.forEach((slide, index) => {
  console.log(`\n--- [ NORMALIZED SLIDE ${index + 1} ] ---`);
  console.log(`ID: ${slide.id}`);
  console.log(`Title: ${JSON.stringify(slide.title)}`);
  console.log(`Type: ${JSON.stringify(slide.type)}`);
  console.log(`Layout Override: ${JSON.stringify(slide.layoutOverride)}`);
  console.log(`Notes: ${JSON.stringify(slide.notes)}`);
  console.log(`Normalized Content Nodes:`);
  console.log(JSON.stringify(slide.content, null, 2));
});
