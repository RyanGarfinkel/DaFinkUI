export interface Theme {
  name: string;
  label: string;
  /** Hex accent color shown as a swatch in the theme picker */
  accent: string;
  /** Tokens applied in light mode */
  light: Record<string, string>;
  /** Tokens applied in dark mode */
  dark: Record<string, string>;
}
