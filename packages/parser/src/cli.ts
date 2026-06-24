#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMarkdownToAST } from './index.js';

function printHelp() {
  console.log(`
Usage: mdslide-parser <input-file.md> [options]

Options:
  -o, --output <file>    Specify output JSON file path. Defaults to <input-file-name>.json.
  -c, --clean            Strip positions and coordinates from AST nodes.
  -h, --help             Show help documentation.
  -v, --version          Show version number.
`);
}

function printVersion() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(packageJson.version);
  } catch {
    console.log('0.0.1');
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    printVersion();
    process.exit(0);
  }

  let inputFile: string | undefined = undefined;
  let outputFile: string | undefined = undefined;
  let cleanAST = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-o' || arg === '--output') {
      outputFile = args[i + 1];
      i++; // Skip the next argument (the value)
    } else if (arg === '-c' || arg === '--clean') {
      cleanAST = true;
    } else if (arg.startsWith('-')) {
      console.error(`Error: Unknown option ${arg}`);
      printHelp();
      process.exit(1);
    } else {
      inputFile = arg;
    }
  }

  if (!inputFile) {
    console.error('Error: Input markdown file is required.');
    printHelp();
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file "${inputFile}" does not exist.`);
    process.exit(1);
  }

  try {
    const markdownContent = fs.readFileSync(inputFile, 'utf8');
    const ast = parseMarkdownToAST(markdownContent, { clean: cleanAST });
    const jsonString = JSON.stringify(ast, null, 2);

    if (!outputFile) {
      const parsedPath = path.parse(inputFile);
      outputFile = path.join(parsedPath.dir, `${parsedPath.name}.json`);
    }

    fs.writeFileSync(outputFile, jsonString, 'utf8');
    console.log(`Successfully parsed AST written to: ${outputFile}`);
  } catch (error) {
    console.error(
      'Error occurred during parsing:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();
