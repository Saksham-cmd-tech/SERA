export interface ColorPalette {
  background: string;
  surface: string;
  surfaceLighter: string;
  surfaceCard: string;
  cardDark: string;
  cardDarker: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;
  border: string;
  borderLight: string;
  positive: string;
  negative: string;
  negativeSurface: string;
  warning: string;
  accent: string;
  accentText: string;
  coral: string;
  coralText: string;
  gridLine: string;
  gridLineActive: string;
  overlay: string;
  transparent: string;
  // Industrial Cyber-Technical tokens from Reference
  panelBone: string;
  panelBoneText: string;
  panelBoneMuted: string;
  panelBoneBorder: string;
  accentRed: string;
  accentRedDark: string;
  accentRedSurface: string;
  slateLight: string;
  techBadgeBg: string;
}

export const darkPalette: ColorPalette = {
  // Apple HIG Dark Mode Palette
  background: '#000000',
  surface: '#1C1C1E',
  surfaceLighter: '#2C2C2E',
  surfaceCard: '#1C1C1E',
  cardDark: '#2C2C2E',
  cardDarker: '#141416',

  // Apple System Typography Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',
  textInverted: '#000000',

  // Hairline borders and dividers (Apple HIG 0.5-1pt separator)
  border: 'rgba(255, 255, 255, 0.12)',
  borderLight: 'rgba(255, 255, 255, 0.08)',

  // Apple System Red Accent
  accent: '#FF3B30',
  accentText: '#FFFFFF',
  accentRed: '#FF3B30',
  accentRedDark: '#D70015',
  accentRedSurface: 'rgba(255, 59, 48, 0.16)',

  // Financial Semantics (Apple System Green, Red, Orange)
  positive: '#34C759',
  negative: '#FF3B30',
  negativeSurface: 'rgba(255, 59, 48, 0.16)',
  warning: '#FF9500',

  coral: '#FF3B30',
  coralText: '#FFFFFF',

  gridLine: 'rgba(255, 255, 255, 0.06)',
  gridLineActive: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.75)',
  transparent: 'transparent',

  panelBone: '#2C2C2E',
  panelBoneText: '#FFFFFF',
  panelBoneMuted: '#8E8E93',
  panelBoneBorder: 'rgba(255, 255, 255, 0.12)',

  slateLight: '#8E8E93',
  techBadgeBg: '#2C2C2E',
};

export const lightPalette: ColorPalette = {
  // Apple HIG Light Mode Palette (System Grouped Background)
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceLighter: '#F8F8FA',
  surfaceCard: '#FFFFFF',
  cardDark: '#E5E5EA',
  cardDarker: '#D1D1D6',

  textPrimary: '#000000',
  textSecondary: '#6C6C70',
  textMuted: '#8E8E93',
  textInverted: '#FFFFFF',

  border: 'rgba(60, 60, 67, 0.14)',
  borderLight: 'rgba(60, 60, 67, 0.08)',

  accent: '#FF3B30',
  accentText: '#FFFFFF',
  accentRed: '#FF3B30',
  accentRedDark: '#D70015',
  accentRedSurface: 'rgba(255, 59, 48, 0.12)',

  positive: '#34C759',
  negative: '#FF3B30',
  negativeSurface: 'rgba(255, 59, 48, 0.12)',
  warning: '#FF9500',

  coral: '#FF3B30',
  coralText: '#FFFFFF',

  gridLine: 'rgba(60, 60, 67, 0.08)',
  gridLineActive: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',

  panelBone: '#FFFFFF',
  panelBoneText: '#000000',
  panelBoneMuted: '#6C6C70',
  panelBoneBorder: 'rgba(60, 60, 67, 0.14)',

  slateLight: '#6C6C70',
  techBadgeBg: '#E5E5EA',
};
