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
}

export const lightPalette: ColorPalette = {
  // Soft warm sage / gray-green from the reference images
  background: '#B8BBA8',
  surface: '#C5C8B5',
  surfaceLighter: '#CFD2C2',
  surfaceCard: '#CACDBB',
  // Dark olive-green rectangular blocks from reference
  cardDark: '#434E40',
  cardDarker: '#343E32',
  // Near-black green text
  textPrimary: '#172018',
  // Muted gray-green secondary text
  textSecondary: '#5A6255',
  textMuted: '#7D8678',
  textInverted: '#F2F5ED',
  // Thin low-opacity dark green borders
  border: 'rgba(23, 32, 24, 0.18)',
  borderLight: 'rgba(23, 32, 24, 0.08)',
  // Muted financial green
  positive: '#346A3E',
  // Coral / burnt orange alert block from reference
  negative: '#E8754F',
  negativeSurface: '#DE6743',
  warning: '#E8754F',
  // Warm muted yellow category block from reference
  accent: '#E4CF55',
  accentText: '#172018',
  coral: '#E8754F',
  coralText: '#FFFFFF',
  gridLine: 'rgba(23, 32, 24, 0.16)',
  gridLineActive: '#172018',
  overlay: 'rgba(23, 32, 24, 0.5)',
  transparent: 'transparent',
};

export const darkPalette: ColorPalette = {
  background: '#151C16',
  surface: '#1E271F',
  surfaceLighter: '#253127',
  surfaceCard: '#242F25',
  cardDark: '#2C3A2E',
  cardDarker: '#1E281F',
  textPrimary: '#EBF0E6',
  textSecondary: '#9AA696',
  textMuted: '#6E7A6B',
  textInverted: '#151C16',
  border: 'rgba(235, 240, 230, 0.16)',
  borderLight: 'rgba(235, 240, 230, 0.08)',
  positive: '#5EA36B',
  negative: '#E8754F',
  negativeSurface: '#9E3C1F',
  warning: '#E8754F',
  accent: '#E4CF55',
  accentText: '#172018',
  coral: '#E8754F',
  coralText: '#FFFFFF',
  gridLine: 'rgba(235, 240, 230, 0.14)',
  gridLineActive: '#EBF0E6',
  overlay: 'rgba(0, 0, 0, 0.75)',
  transparent: 'transparent',
};
