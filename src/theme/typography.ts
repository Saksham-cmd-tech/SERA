import { TextStyle, Platform } from 'react-native';

export const fonts = {
  inter: {
    regular: Platform.select({ ios: 'Inter-Regular', android: 'Inter-Regular', default: 'sans-serif' }),
    medium: Platform.select({ ios: 'Inter-Medium', android: 'Inter-Medium', default: 'sans-serif-medium' }),
    semiBold: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter-SemiBold', default: 'sans-serif-medium' }),
    bold: Platform.select({ ios: 'Inter-Bold', android: 'Inter-Bold', default: 'sans-serif' }),
    extraBold: Platform.select({ ios: 'Inter-ExtraBold', android: 'Inter-ExtraBold', default: 'sans-serif' }),
  },
  mono: {
    regular: Platform.select({ ios: 'JetBrainsMono-Regular', android: 'JetBrainsMono-Regular', default: 'monospace' }),
    medium: Platform.select({ ios: 'JetBrainsMono-Medium', android: 'JetBrainsMono-Medium', default: 'monospace' }),
    semiBold: Platform.select({ ios: 'JetBrainsMono-SemiBold', android: 'JetBrainsMono-SemiBold', default: 'monospace' }),
    bold: Platform.select({ ios: 'JetBrainsMono-Bold', android: 'JetBrainsMono-Bold', default: 'monospace' }),
    extraBold: Platform.select({ ios: 'JetBrainsMono-ExtraBold', android: 'JetBrainsMono-ExtraBold', default: 'monospace' }),
  },
};

export const typography = {
  // Dominant amount / balance figures (JetBrains Mono Bold)
  displayLarge: {
    fontSize: 48,
    lineHeight: 54,
    fontWeight: '700',
    letterSpacing: -1.2,
    fontVariant: ['tabular-nums'],
    fontFamily: fonts.mono.bold,
  } as TextStyle,
  
  displayMedium: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
    fontFamily: fonts.mono.bold,
  } as TextStyle,

  // Technical Page heading (Inter Bold)
  pageHeading: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
    fontFamily: fonts.inter.bold,
  } as TextStyle,

  pageSubheading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontFamily: fonts.inter.semiBold,
  } as TextStyle,

  // Section heading (Inter Bold)
  sectionHeading: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: fonts.inter.bold,
  } as TextStyle,

  // Card title (Inter SemiBold)
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontFamily: fonts.inter.semiBold,
  } as TextStyle,

  // Body text (Inter Regular)
  bodyLarge: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: fonts.inter.regular,
  } as TextStyle,

  bodyMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: fonts.inter.regular,
  } as TextStyle,

  // Metadata / Timestamps (JetBrains Mono Medium)
  metadata: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 0.4,
    fontFamily: fonts.mono.medium,
  } as TextStyle,

  // Architectural / Spec labels (JetBrains Mono Bold uppercase)
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: fonts.mono.bold,
  } as TextStyle,

  labelSmall: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fonts.mono.bold,
  } as TextStyle,

  // Technical Monospace & Spec tags
  specCode: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    fontFamily: fonts.mono.bold,
    textTransform: 'uppercase',
  } as TextStyle,

  // Tabular amount figures (JetBrains Mono Bold)
  amountLarge: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    fontFamily: fonts.mono.bold,
  } as TextStyle,

  amountMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    fontFamily: fonts.mono.bold,
  } as TextStyle,

  amountSmall: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    fontFamily: fonts.mono.bold,
  } as TextStyle,
};
