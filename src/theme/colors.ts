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
  // Deep technical dark navy / midnight obsidian
  background: '#090E14',
  surface: '#111822',
  surfaceLighter: '#17222F',
  surfaceCard: '#131C27',
  cardDark: '#1A2534',
  cardDarker: '#0D141D',

  // High-contrast technical typography
  textPrimary: '#F2F5F8',
  textSecondary: '#8B97A6',
  textMuted: '#586574',
  textInverted: '#FFFFFF',

  // Hairline borders and dividers matching Stitch
  border: '#1F2A38',
  borderLight: '#1F2A38',

  // Controlled Crimson / Vermilion Red accent from reference
  accent: '#EB3B2E',
  accentText: '#FFFFFF',
  accentRed: '#EB3B2E',
  accentRedDark: '#C92A1E',
  accentRedSurface: 'rgba(235, 59, 46, 0.16)',

  // Positive financial green & warning
  positive: '#34D399',
  negative: '#EB3B2E',
  negativeSurface: 'rgba(235, 59, 46, 0.18)',
  warning: '#F59E0B',

  // Coral / Alert alias mapped to industrial crimson
  coral: '#EB3B2E',
  coralText: '#FFFFFF',

  // Grid lines
  gridLine: 'rgba(255, 255, 255, 0.08)',
  gridLineActive: '#EB3B2E',
  overlay: 'rgba(5, 8, 12, 0.85)',
  transparent: 'transparent',

  // Warm bone sand contrast panel from reference
  panelBone: '#E4DFD7',
  panelBoneText: '#0A0F15',
  panelBoneMuted: '#68645C',
  panelBoneBorder: '#C9C3BA',

  // Silver / technical slate light
  slateLight: '#B9C0C8',
  techBadgeBg: '#0D141D',
};

export const lightPalette: ColorPalette = {
  // Light mode variant still follows the technical industrial aesthetic
  background: '#EAEBE6',
  surface: '#F4F5F1',
  surfaceLighter: '#FFFFFF',
  surfaceCard: '#F0F1ED',
  cardDark: '#E2E8F0',
  cardDarker: '#CBD5E1',

  textPrimary: '#0C1117',
  textSecondary: '#5C6775',
  textMuted: '#7D8895',
  textInverted: '#FFFFFF',

  border: 'rgba(12, 17, 23, 0.14)',
  borderLight: 'rgba(12, 17, 23, 0.07)',

  accent: '#EB3B2E',
  accentText: '#FFFFFF',
  accentRed: '#EB3B2E',
  accentRedDark: '#C92A1E',
  accentRedSurface: 'rgba(235, 59, 46, 0.12)',

  positive: '#10B981',
  negative: '#EB3B2E',
  negativeSurface: 'rgba(235, 59, 46, 0.12)',
  warning: '#D97706',

  coral: '#EB3B2E',
  coralText: '#FFFFFF',

  gridLine: 'rgba(12, 17, 23, 0.12)',
  gridLineActive: '#EB3B2E',
  overlay: 'rgba(12, 17, 23, 0.6)',
  transparent: 'transparent',

  panelBone: '#E4DFD7',
  panelBoneText: '#0A0F15',
  panelBoneMuted: '#68645C',
  panelBoneBorder: '#C9C3BA',

  slateLight: '#C3C9D0',
  techBadgeBg: '#E2E8F0',
};
