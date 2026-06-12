import { icons } from '../assets/index.js';
import { STYLES, COLORS } from '../constants/index.js';

export function c(color: string, text: string): string {
  if (!process.stdout.isTTY) return text;
  return `${color}${text}${STYLES.reset}`;
}

export function link(url: string): string {
  if (!process.stdout.isTTY) return url;
  return `${COLORS.cyan}${STYLES.bold}${url}${STYLES.reset}`;
}

export const ICONS = {
  info: c(COLORS.blue, icons.info),
  success: c(COLORS.green, icons.succcess),
  warn: c(COLORS.yellow, icons.warning),
  error: c(COLORS.red, icons.cross),
  step: c(COLORS.cyan, icons.rightArrow),
  dim: c(COLORS.grey, icons.dim),
};
