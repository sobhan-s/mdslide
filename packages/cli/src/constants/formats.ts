import { COLORS } from './terminalEscapeCode.js';

export const outputFormat = [
  {
    label: 'HTML',
    value: 'html',
    hint: 'Fast, shareable in browser',
    color: COLORS.green,
  },
  {
    label: 'PDF',
    value: 'pdf',
    hint: 'Print-ready, needs Chromium based Browser',
    color: COLORS.red,
  },
  { label: 'PPTX', value: 'pptx', hint: 'PowerPoint compatible', color: COLORS.blue },
];

export const themeTypes = [
  {
    label: 'Light',
    value: 'light',
    hint: 'Clean white background',
    color: COLORS.white,
  },
  { label: 'Dark', value: 'dark', hint: 'Dark background', color: COLORS.grey },
  {
    label: 'Notion',
    value: 'notion',
    hint: 'Notion-style minimal',
    color: COLORS.white,
  },
  {
    label: 'Terminal',
    value: 'terminal',
    hint: 'Hacker green on black',
    color: COLORS.green,
  },
  {
    label: 'Gradient',
    value: 'gradient',
    hint: 'Colorful gradient bg',
    color: COLORS.magenta,
  },
  {
    label: 'Corporate',
    value: 'corporate',
    hint: 'Corporate modern look',
    color: COLORS.blue,
  },
  {
    label: 'Solarized',
    value: 'solarized',
    hint: 'Warm editorial layout',
    color: COLORS.yellow,
  },
];
