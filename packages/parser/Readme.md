# `@mindfiredigital/mdslide-parser`

Parses a Markdown string into a structured array of `Slide` objects, ready to be consumed by a slide renderer. It handles slide splitting, heading extraction, and automatic layout detection.

---

## How It Works

The parser runs the input through three sequential steps:

1. **Parse** — The raw Markdown string is parsed into an  AST using [`remark-parse`](https://github.com/remarkjs/remark/tree/main/packages/remark-parse).
2. **Split** — The AST is walked to split content into individual slides.
3. **Detect Layout** — Each slide is inspected and assigned a layout type based on its content.

---

## Slide Splitting Rules

| Markdown construct           | Behavior                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `# H1` at the top of a slide | Sets the `title` of the current slide                                              |
| `## H2`                      | Ends the current slide and starts a new one, using the heading text as its `title` |
| `***` (thematic break)       | Ends the current slide and starts a new blank one                                  |
| Any other node               | Appended to the `content` array of the current slide                               |

---

## Layout Detection

After splitting, each slide is assigned one of three `type` values:

| Type        | Condition                                         |
| ----------- | ------------------------------------------------- |
| `"title"`   | Slide has a `title` and no `content`              |
| `"bullets"` | Slide `content` contains at least one `list` node |
| `"content"` | Default — everything else                         |

---

## Package Info

| Field             | Value                             |
| ----------------- | --------------------------------- |
| Package name      | `@mindfiredigital/mdslide-parser` |
| Module format     | ESM (`"type": "module"`)          |
| Entry point       | `dist/index.js`                   |
| Type declarations | `dist/index.d.ts`                 |

---

## Development

```bash
# Build once
pnpm build

# Watch mode
pnpm dev

# Clean build output
pnpm clean
```
