import { PptxTheme } from '../../types/index.js';

export const PPTX_THEMES: Record<string, PptxTheme> = {
  light: {
    bg: 'FAF9F6',
    text: '1E293B',
    accent: '4F46E5',
    font: 'Trebuchet MS',
    cardBg: 'F1F5F9',
  },
  dark: {
    bg: '0F172A',
    text: 'F1F5F9',
    accent: '38BDF8',
    font: 'Trebuchet MS',
    cardBg: '1E293B',
  },
  notion: {
    bg: 'FFFFFF',
    text: '37352F',
    accent: '0F7B6C',
    font: 'Arial',
    cardBg: 'F4F4F5',
  },
  terminal: {
    bg: '0B0F19',
    text: '10B981',
    accent: '34D399',
    font: 'Courier New',
    cardBg: '111827',
  },
  gradient: {
    bg: '1E1B4B',
    text: 'F8FAFC',
    accent: 'C084FC',
    font: 'Georgia',
    cardBg: '312E81',
  },
  corporate: {
    bg: 'FFFFFF',
    text: '0F172A',
    accent: '0EA5E9',
    font: 'Calibri',
    cardBg: 'F8FAFC',
  },
  solarized: {
    bg: 'FDF6E3',
    text: '073642',
    accent: '268BD2',
    font: 'Georgia',
    cardBg: 'EEE8D5',
  },
};

export const BULLET_CHARS: Record<number, string> = {
  0: '2022',
  1: '25E6',
  2: '25AA',
};
