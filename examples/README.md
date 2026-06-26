# mdslide Feature Examples

This directory contains complete, working Markdown files that demonstrate every major layout, custom styling, and advanced formatting feature of `mdslide`.

You can compile, test, or live-preview these files using the `mdslide` CLI.

## How to Compile & Preview

To compile a specific example and open it in your browser immediately:

```bash
# Basic Layouts example
bun run build # Make sure workspaces are built
npx mdslide compile examples/01-basic-layouts.md --open

# Column Splits example
npx mdslide compile examples/02-columns-split.md --open

# Advanced Formatting (Math, GFM, Mermaid)
npx mdslide compile examples/03-math-gfm-mermaid.md --open

# Custom CSS & Fonts override
npx mdslide compile examples/04-custom-css-fonts.md --open

# Speaker Notes & Presenter View
npx mdslide compile examples/05-speaker-notes.md --open

# Background Images with Auto-Contrast
npx mdslide compile examples/06-backgrounds.md --open
```

## Running Dev Server / Live Watch Mode

To watch a file for live-reloading as you modify it:

```bash
npx mdslide watch examples/04-custom-css-fonts.md --open
```
