---
title: MdSlide Feature Showcase
theme: light
author: Sobhan Sahoo
---

# Welcome to MdSlide!

## The Premium Markdown Presentation Compiler

Sobhan Sahoo | May 2026

---

# Focus on Content

> "MdSlide transforms simple Markdown into premium, responsive, high-fidelity slides automatically."

---

# Premium Split Columns

### Auto-Detecting Split Layouts

- **Side-by-Side Design:** When a slide contains exactly one image alongside text content, MdSlide automatically transforms the layout into a gorgeous split column display.
- **Perfect Balance:** 50% left text column, 50% right image column.
- **Visual Polish:** Images feature subtle border radii and drop shadows matching the active theme perfectly.

![Workspace Laptop Showcase](https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80)

---

# Custom Split Columns

### Manual override using `::split::`

Here is a list of features on the left:

- **Manual Override:** Use the simple `::split::` tag to split any content block manually.
- **Flexible Layouts:** Mix text, lists, and tables next to code blocks or images.
- **Optimal Balance:** Keep columns aligned beautifully matching modern web spacing.

::split::

```typescript
// Custom Split Code on the right!
const compiler = new MdSlideCompiler();
const deck = compiler.compile('presentation.md');
console.log('Deck compiled successfully!');
```

---

# Beautiful Code Highlighting

### Rich syntax highlights & line numbers

::split::

```typescript
// Define editor configuration options
interface EditorConfig {
  target: string | HTMLElement;
  autofocus?: boolean;
  theme?: 'light' | 'dark';
}

class TextIgniter {
  private config: EditorConfig;

  constructor(config: EditorConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    console.log('Initializing rich-text editor...');
  }
}
```

---

# Rich Markdown Features

### Inline Elements & formatting

This slide shows standard markdown text with various inline tags:

- **Bold text** to emphasize keys.
- _Italic emphasis_ for subtle styles.
- Useful [Hyperlinks](https://github.com/Sobhan-Sahoo) for navigation.
- Critical inline code segments: `const editor = new TextIgniter()` (perfectly styled and readable!).

---

# Comparison Grid

### Clean Feature Matrix

| Feature               | MdSlide                  | Traditional Tools      |
| :-------------------- | :----------------------- | :--------------------- |
| **Workflow**          | Clean Markdown           | Heavy Drag-and-Drop    |
| **Layouts**           | Responsive & Auto-scaled | Fixed Viewports        |
| **Syntax Highlights** | Native PrismJS           | Manual Copy-Paste      |
| **Overflow Engine**   | Heuristic Auto-splitting | Manual slide splitting |

---

# Overflow Engine Test

### Verifying Heuristic Splitting

This slide contains many items. Because it exceeds the content budget, MdSlide will split it recursively without leaving awkward continuation slides!

- **Item 1:** First list item containing basic descriptive context.
- **Item 2:** Second list item illustrating slide pacing.
- **Item 3:** Third list item highlighting vertical alignment.
- **Item 4:** Fourth list item to ensure vertical breathing room.
- **Item 5:** Fifth list item verifying content distribution.
- **Item 6:** Sixth list item showing split-balance heuristics.
- **Item 7:** Seventh list item proving continuation slides are eliminated when remainder size is small.

---

# Stacking Multiple Images

### Visual Stacking Layout (2 Images)

When a slide contains multiple images, they stack vertically (or inherit standard block flow) to preserve their logical reading order:

- **Image 1 (Tech Setup):**
  ![Tech Setup](https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=300&q=80)
- **Image 2 (Design Wireframe):**
  ![Design Wireframe](https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=300&q=80)

---

# Deeply Nested Images

### Extracting images from nested lists

- MdSlide's AST compiler features a recursively deep scanner.
- Even if an image is nested inside a list item or deep paragraph:
  - **Nested Image:**
    ![Mobile Mockup](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80)
  - The transform engine extracts it and elevates it to a gorgeous split layout!

---

# Image Overflow Stress Test

### Dense content with multiple heavy nodes

This slide contains bullet points, lists, and two heavy images on the same page. This will test how the visual overflow engine splits these elements cleanly so pages don't clip!

- **First Phase:** Designing user interface frames and setting style tokens.
- **Second Phase:** Building interactive web component wrappers.
- **Image 1 (Team Board):**
  ![Team Board](https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80)
- **Third Phase:** Deploying automated testing suites in chromium pipelines.
- **Image 2 (Analytics Dashboard):**
  ![Analytics Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80)

---

# Ultimate Code Splitter Blast Test

### Extremely long program segment (70 lines of code)

This is an ultimate stress test for recursive code splitting. The compiler must split this code block across multiple slides cleanly, preserving correct syntax highlighting and line numbers on all continuation pages!

```typescript
class ParserEngine {
  private rawInput: string;
  private tokens: string[] = [];

  constructor(input: string) {
    this.rawInput = input;
  }

  public tokenize(): string[] {
    console.log('Tokenizing raw string input...');
    let buffer = '';
    for (let char of this.rawInput) {
      if (char === ' ' || char === '\n') {
        if (buffer.length > 0) {
          this.tokens.push(buffer);
          buffer = '';
        }
      } else {
        buffer += char;
      }
    }
    if (buffer.length > 0) {
      this.tokens.push(buffer);
    }
    return this.tokens;
  }

  public parseAST(): Record<string, any> {
    const ast: Record<string, any> = { type: 'Root', children: [] };
    for (let token of this.tokens) {
      if (token.startsWith('#')) {
        ast.children.push({ type: 'Header', value: token.slice(1) });
      } else if (token.startsWith('-')) {
        ast.children.push({ type: 'ListItem', value: token.slice(1) });
      } else {
        ast.children.push({ type: 'Word', value: token });
      }
    }
    return ast;
  }

  public printSummary(): void {
    console.log('=== Parsing Summary ===');
    console.log(`Raw Input Length: ${this.rawInput.length}`);
    console.log(`Total Tokens Scanned: ${this.tokens.length}`);
    console.log(`AST Node Count: ${this.parseAST().children.length}`);
  }

  public reset(): void {
    this.tokens = [];
    this.rawInput = '';
    console.log('Parser state cleared successfully.');
  }
}
```

---

# Complex Matrix Table Blast Test

### Highly detailed feature comparison board

A large complex multi-row comparison grid demonstrating responsive scaling on wide, heavy tables:

| Framework            | File Size | Render Speed | Extension System      | Core Dependency      | Native Features      | Production Stature |
| :------------------- | :-------- | :----------- | :-------------------- | :------------------- | :------------------- | :----------------- |
| **MdSlide**          | **14KB**  | **0.8ms**    | Full Markdown AST     | None (Vanilla)       | Auto-split, PrismJS  | Extremely Stable   |
| **Traditional CLI**  | 450KB     | 150ms        | Basic regex templates | Heavy NodeJS modules | Static HTML defaults | Legacy             |
| **Keynote Deck**     | 12MB      | N/A          | None (Manual XML)     | macOS Native         | Dynamic transitions  | Proprietary        |
| **Google Slides**    | Cloud     | 1.2s         | Google Apps Script    | Heavy GSuite APIs    | Interactive widgets  | Enterprise         |
| **VitePress Slides** | 890KB     | 25ms         | Vue Components        | Vue, Vite, Rollup    | Markdown support     | Modern             |

---

# Extremely Nested Lists Blast Test

### Nested list indentation stress test

This list goes extremely deep into sub-nested bullet lists to test visual layout padding and scale constraints:

- **Core Level 1 Item**
  - Sub-Level 2 Item (with nested elements)
    - Sub-Level 3 Item (with inline tags: `const nested = true`)
      - **Sub-Level 4 Item (Giga Deep!):** This is nested four levels deep, demonstrating how theme left-padding styles behave!
      - Another Sub-Level 4 bullet item to verify stack breathing room.
    - Back to Level 3 Bullet point.
  - Level 2 secondary bullet point.
- **Core Level 1 Secondary Item**
  - Secondary Sub-Level 2 item.

---

# Giant Split Layout Overflow Blast Test

### Overflowing a side-by-side split layout

This slide has exactly ONE image alongside 15 detailed bullet points. This will test how the compiler handles a split layout slide that exceeds the vertical height limits!

- **Item 1:** Let's see if the layout splitter divides this slide cleanly.
- **Item 2:** Second bullet item testing split columns.
- **Item 3:** Third bullet item testing split columns.
- **Item 4:** Fourth bullet item testing split columns.
- **Item 5:** Fifth bullet item testing split columns.
- **Item 6:** Sixth bullet item testing split columns.
- **Item 7:** Seventh bullet item testing split columns.
- **Item 8:** Eighth bullet item testing split columns.
- **Item 9:** Ninth bullet item testing split columns.
- **Item 10:** Tenth bullet item testing split columns.
- **Item 11:** Eleventh bullet item testing split columns.
- **Item 12:** Twelfth bullet item testing split columns.
- **Item 13:** Thirteenth bullet item testing split columns.
- **Item 14:** Fourteenth bullet item testing split columns.
- **Item 15:** Fifteenth bullet item testing split columns.

![Gorgeous Workspace View](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80)
