# @mindfiredigital/mdslide-parser

A standalone Markdown parser that compiles markdown strings into standard MDAST (Markdown Abstract Syntax Tree) JSON structures. It does not perform slide-based splitting, acting as a clean, decoupled parsing library.

## Installation

Install as a dependency:

```bash
npm install @mindfiredigital/mdslide-parser
# or
bun add @mindfiredigital/mdslide-parser
```

---

## 🛠 Programmatic API Usage

The default export function can be imported and called directly.

### 1. Default Parsing

```typescript
import parser from '@mindfiredigital/mdslide-parser';

const ast = parser('# Hello World\nParagraph content.');
console.log(JSON.stringify(ast, null, 2));
```

### 2. Clean AST (Strip Coordinates/Positions)

If you don't need line/column coordinate numbers in your AST, you can strip them:

- **Options parameter**:
  ```typescript
  const ast = parser(markdown, { clean: true });
  ```
- **Method Chaining**:
  ```typescript
  const ast = parser(markdown).clean();
  ```
- **Namespace Helper**:
  ```typescript
  const ast = parser.clean(markdown);
  // Strip position from an existing AST object
  const stripped = parser.strip(originalAst);
  ```
- **Builder Pattern**:
  ```typescript
  const ast = parser().clean(markdown);
  const ast2 = parser().parse(markdown, { clean: true });
  ```

---

## CLI Usage

You can run the standalone parser CLI to dump MDAST JSON files directly from the command line:

```bash
# Globally installed, or via npx/bunx:
npx mdslide-parser input.md [options]
```

### CLI Options:

- `-o, --output <file>`: Specify output JSON file path. Defaults to `<input-file-name>.json`.
- `-c, --clean`: Strip positions and coordinates from the output AST nodes.
- `-h, --help`: Show help documentation.
- `-v, --version`: Show version number.

### Examples:

```bash
# Parse to input.json (includes coordinates)
npx mdslide-parser input.md

# Parse to custom output file and strip coordinates
npx mdslide-parser input.md -o output.json --clean
```
