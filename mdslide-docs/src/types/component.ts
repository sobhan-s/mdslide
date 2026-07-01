export interface NavbarProps {
  scrolled: boolean;
  isDark: boolean;
  starsCount: string;
  navbarCopied: boolean;
  onCopy: (text: string, setCopied: (val: boolean) => void) => void;
  setNavbarCopied: (val: boolean) => void;
  onToggleTheme: () => void;
}

export interface CommandSeq {
  input: string;
  output: string;
}
