# @mindfiredigital/mdslide-cli

> **mdslide** is a modern, modular, high-performance compiler and presentation tool that converts Markdown documents into gorgeous interactive slide decks in HTML, PDF, or PowerPoint (PPTX) formats.

---

## Key Features

- **Auto-live preview / hot-reload server**: Automatically compiles and updates your browser presentation as you edit your markdown.
- **Gorgeous Built-in Themes**: Clean, modern aesthetics out-of-the-box (`light`, `dark`, `notion`, `terminal`, `gradient`, `corporate`, `solarized`).
- **Multi-format Exports**: Generate presentation-ready standalone HTML, printable PDF, or PowerPoint (PPTX) files (supports both screenshot and editable text layouts).
- **Smart Layout Engine**: Detects your content structure to apply the best matching layout (e.g. `bullets`, `code`, `visual`, `table`, `quote`, `statement`).
- **List & Code Overflow Splitting**: Automatically flows long code blocks and lists across multiple slides to prevent layout overflow.
- **Speaker Notes Panel**: Native presenter view support for your presentation delivery.

---

## Installation

Install the CLI globally using your preferred package manager:

```bash
npm install -g @mindfiredigital/mdslide-cli
# or
bun add -g @mindfiredigital/mdslide-cli
```

---

## CLI Commands & Usage

`mdslide` offers several commands to manage, compile, preview, and validate your markdown slides.

```bash
mdslide <command> [input] [options]
```

### 1. Interactive Mode (Default)

Running the binary with just your input markdown file (without specifying a subcommand) launches an interactive CLI wizard.

```bash
mdslide slides.md
```

- **What it does**: Starts an interactive prompt wizard that guides you to choose your theme, output format, destination file path, and whether to launch the live preview server or run a single compilation.
- **Input**: A path to your markdown file.
- **Output**: Prompts terminal questions and then compiled output files or triggers a watch server.

---

### 2. Compile Slides (`mdslide compile`)

Compiles a Markdown presentation into a single target file.

```bash
mdslide compile <input> [options]
```

- **What it does**: Performs a one-time build parsing your markdown, styling it using the specified theme, resolving layout elements, and rendering the selected presentation output format.
- **Input**: Path to your markdown file (`<input>`).
- **Options**:
  - `-t, --theme <theme>`: Theme choice (`light`, `dark`, `notion`, `terminal`, `gradient`, `corporate`, `solarized`).
  - `-o, --output <file>`: Output file path. Defaults to `output.<format>` (e.g. `output.html`).
  - `-f, --format <format>`: Format type (`html` | `pdf` | `pptx`). Auto-detected from your `-o` file extension if omitted.
  - `--pptx-mode <mode>`: PPTX layout generation mode. `screenshot` compiles slides exactly as they appear in browser view; `editable` translates lists/text elements into editable PPTX shapes. Default: `screenshot`.
  - `-i, --interactive`: Explicitly forces compilation via the interactive wizard.
  - `--open`: Opens the compiled presentation immediately in your browser or default system application.
  - `--strict`: Exits compilation with an error code if any parser warnings are raised.
  - `--verbose`: Logs detailed compilation and layout diagnostic reports.
  - `--silent`: Suppresses all console output.
- **Output**: A generated file (e.g., `output.html`, `output.pdf`, `output.pptx`) containing your structured presentation slides.

**Examples:**

```bash
mdslide compile slides.md --theme dark --open
mdslide compile slides.md -o quarterly-report.pdf
mdslide compile slides.md -f pptx --pptx-mode editable
```

---

### 3. Hot-Reload Dev Server (`mdslide watch`)

Starts a local development server with live-reloading.

```bash
mdslide watch <input> [options]
```

- **What it does**: Watches your input markdown file for changes. Whenever you edit and save your file, the CLI automatically compiles it behind the scenes and pushes updates to your browser instantly without manual page refreshes.
- **Input**: Path to your markdown file (`<input>`).
- **Options**:
  - `-t, --theme <theme>`: Theme override choice.
  - `-p, --port <port>`: Port to bind the dev server. Default: `3500`.
  - `--open`: Automatically opens your presentation in your default web browser on launch.
  - `--verbose`: Logs detailed file changes and reload events.
  - `--silent`: Suppresses all terminal logging.
- **Output**: A running local server at `http://localhost:<port>` presenting your interactive slide deck, reflecting modifications in real-time.

**Examples:**

```bash
mdslide watch slides.md --port 4000 --open
```

---

### 4. Create Template Config (`mdslide init`)

Scaffolds a new configuration template and sample presentation in your current directory.

```bash
mdslide init [options]
```

- **What it does**: Generates a default `mdslide.config.ts` configuration file and a sample `slides.md` deck to help you start presenting quickly. If a `package.json` file is present in your current working directory, it will automatically append `"dev"` and `"build"` scripts.
- **Input**: None.
- **Options**:
  - `--force`: Overwrites existing `slides.md` or `mdslide.config.ts` files if they exist.
  - `--silent`: Suppresses all console logs.
- **Output**:
  - A `slides.md` file pre-filled with demo slides.
  - A `mdslide.config.ts` file pre-populated with structure settings.
  - Modified `package.json` (if present) containing helper script shortcuts.

---

### 5. Check Layout & Lint Issues (`mdslide validate`)

Sanity checks your slide deck for formatting and budget issues.

```bash
mdslide validate <input> [options]
```

- **What it does**: Scans your markdown presentation for syntax anomalies, invalid layout overrides, broken local image assets, and checks if slide contents exceed heights/vertical budget constraints (which could cause slide overflow).
- **Input**: Path to your markdown file (`<input>`).
- **Options**:
  - `--strict`: Exits with status code `1` if any warning level messages are found.
  - `--verbose`: Outputs verbose warnings and checks.
  - `--silent`: Suppresses all output.
- **Output**: A structured terminal diagnostic report containing `Errors` (must-fix) and `Warnings` (recommendations).

---

### 6. Interactive Command (`mdslide interactive`)

Explicitly runs the interactive wizard.

```bash
mdslide interactive <input> [options]
```

- **What it does**: Acts as a shortcut to trigger the interactive walkthrough wizard for compiling or watching.
- **Input**: Path to your markdown file (`<input>`).
- **Options**:
  - `--verbose`/`--silent`: Logging level modifiers.
- **Output**: Interactive questions followed by compile or preview server launches.

---

## Configuration File (`mdslide.config.ts`)

You can customize compilation defaults using a configuration file in your root folder.

Create a `mdslide.config.ts` file:

```typescript
import { defineConfig } from '@mindfiredigital/mdslide-cli';

export default defineConfig({
  theme: 'gradient',
  output: 'dist/presentation.html',
  watch: {
    port: 4200,
    open: true,
  },
  pdf: {
    printBackground: true,
  },
});
```

#### **Configuration Reference**

The configuration object passed to `defineConfig` supports the following properties:

| Property              | Type                        | Description                                                                                       |
| :-------------------- | :-------------------------- | :------------------------------------------------------------------------------------------------ |
| `theme`               | `string`                    | Default design theme for compilation (e.g. `'gradient'`, `'dark'`, `'notion'`).                   |
| `output`              | `string`                    | Default output filename or relative path (e.g. `'dist/deck.html'`).                               |
| `format`              | `'html' \| 'pdf' \| 'pptx'` | Default compilation export format.                                                                |
| `watch.port`          | `number`                    | Port for the live watch server (default: `3500`).                                                 |
| `watch.open`          | `boolean`                   | Automatically launch the web browser upon watch server startup (default: `true`).                 |
| `pdf.chromePath`      | `string`                    | Custom binary file path to the local Chrome/Chromium installation (for headless browser exports). |
| `pdf.printBackground` | `boolean`                   | Print CSS background colors/gradients during PDF export (default: `true`).                        |
