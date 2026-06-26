# mdslide

`mdslide` is a modular, high-performance monorepo compiler and presentation tool that converts Markdown documents into gorgeous interactive slide decks in HTML, PDF, or editable/screenshot PPTX formats.

---

## Project Structure

The project is structured as a monorepo containing the following workspaces under the `packages/` directory:

- **[`@mindfiredigital/mdslide-cli` (packages/cli)](packages/cli/README.md)**: Command line interface for compiling, watching, linting, and interactive wizard generation.
- **[`@mindfiredigital/mdslide-core` (packages/core)](packages/core/README.md)**: The core compilation engine, slide normalizer, overflow splitted parser, and HTML/PDF/PPTX output renderers.
- **[`@mindfiredigital/mdslide-parser` (packages/parser)](packages/parser/README.md)**: Standalone markdown parser producing MDAST JSON format, exposing programmatic defaults (with position coordinates cleaning option) and a standalone CLI.
- **[`@mindfiredigital/mdslide-shared` (packages/shared)](packages/shared/README.md)**: Shared common utility functions, helpers, and TypeScript types.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.x or higher) installed on your system.

### Installation

fork the repository and install dependencies at the root:

```bash
bun install
```

### Local Development Commands

Run the following scripts from the root directory:

- **Build all packages**:
  ```bash
  bun run build
  ```
- **Start development / watch mode**:
  ```bash
  bun run dev
  ```
- **Format codebase**:
  ```bash
  bun run format
  ```
- **Lint codebase**:
  ```bash
  bun run lint
  ```
- **Run tests**:
  ```bash
  bun run test
  ```
- **Run test coverage**:
  ```bash
  bun run test:coverage
  ```

---

## Developer Guide

We welcome contributions! Please follow this developer guide to ensure smooth collaboration.

### 1. Opening an Issue

Before starting any implementation, please search existing issues or open a new one to discuss:

- **Bug reports**: Include steps to reproduce, expected vs actual behavior, and environment info (OS, Bun version).
- **Feature requests**: Describe the use-case, proposed API/options, and why it is beneficial.

### 2. Developing Features

- Create a new branch off `dev`:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Always add unit tests for your changes. Tests are located in `packages/<package>/tests/`.
- Ensure tests, formatting, and linting pass locally before proposing changes:
  ```bash
  bun run format
  bun run lint
  bun run test
  ```

### 3. Creating a Changeset

We use Changesets to track package version updates and generate changelogs automatically. If your changes affect user-facing code:

- Run the changeset command:
  ```bash
  bun changeset
  ```
- Select the package(s) that were modified and the bump type (major, minor, or patch).
- Enter a description of what changed. This will be added to the `.changeset` directory and committed.

### 4. Submitting a Pull Request

- Push your branch to GitHub and open a Pull Request (PR) targeting the `dev` branch.
- Explain the implementation details, how it was tested, and link the related issue.
- Ensure all CI workflow tests pass on your PR.

### 5. Versioning & Publishing (Maintainers)

When merging to the default branch:

- Changes merged to `dev` will be staged.
- Once ready for release, changes are merged into `main`.
- The Release CI workflow automatically detects changesets, bumps versions, publishes packages to npm, builds compiled binaries for various platforms, and uploads them to a GitHub Release.
