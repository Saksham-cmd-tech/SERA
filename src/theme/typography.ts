import { TextStyle, Platform } from 'react-native';

const fontFamilyRegular = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

const fontFamilyMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'sans-serif',
});

export const typography = {
  // Large financial display number (48-64px)
  displayLarge: {
    fontSize: 54,
    lineHeight: 60,
    fontWeight: '700',
    letterSpacing: -1.5,
    fontFamily: fontFamilyMedium,
  } as TextStyle,
  
  displayMedium: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -1,
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  // Page heading (32-40px)
  pageHeading: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  pageSubheading: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
    letterSpacing: -0.3,
    fontFamily: fontFamilyRegular,
  } as TextStyle,

  // Section heading (20-26px)
  sectionHeading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  // Card title (16-20px)
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  // Body text (14-16px)
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: fontFamilyRegular,
  } as TextStyle,

  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: fontFamilyRegular,
  } as TextStyle,

  // Metadata / Timestamps (10-12px)
  metadata: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: fontFamilyRegular,
  } as TextStyle,

  // Architectural labels (9-11px, uppercase with letter-spacing)
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  labelSmall: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  // Monospace / tabular numbers for amounts
  amountLarge: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  amountMedium: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    fontFamily: fontFamilyMedium,
  } as TextStyle,

  amountSmall: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    fontFamily: fontFamilyMedium,
  } as TextStyle,
};
