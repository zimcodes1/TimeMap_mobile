export const colors = {
  // Brand Primary — emerald green
  primary: '#10b981',
  primaryHover: '#059669',
  primaryMuted: '#064e3b',
  primaryForeground: '#ffffff',

  // Secondary
  secondary: '#27272a',
  secondaryHover: '#3f3f46',
  secondaryMuted: '#27272a',
  secondaryForeground: '#f4f4f5',

  // Dark Surfaces & Backgrounds
  background: '#09090b',
  surface: '#18181b',
  surfaceRaised: '#27272a',

  // Dark Mode Typography
  textMain: '#ffffff',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  textInverse: '#09090b',

  // Borders & Overlay
  border: '#27272a',
  borderStrong: '#3f3f46',
  ring: 'rgba(16, 185, 129, 0.4)',

  // Semantic
  danger: '#ef4444',
  dangerForeground: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

export type Colors = typeof colors;
