import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { AppText } from './AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SeraLogoProps {
  size?: number;
  showText?: boolean;
  showTagline?: boolean;
  tagline?: string;
  direction?: 'row' | 'column';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  badgeBgColor?: string;
  badgeTextColor?: string;
}

export const SeraLogo: React.FC<SeraLogoProps> = ({
  size = 28,
  showText = false,
  showTagline = false,
  tagline = 'Spending & Expense Record App',
  direction = 'row',
  style,
  textStyle,
  badgeBgColor,
  badgeTextColor,
}) => {
  const { colors } = useAppTheme();

  const circleBg = badgeBgColor || colors.positive;
  const symbolColor = badgeTextColor || colors.textInverted;

  return (
    <View
      style={[
        styles.container,
        direction === 'column' ? styles.columnLayout : styles.rowLayout,
        style,
      ]}
    >
      {/* Official SERA Geometric Dual-Tone S Emblem */}
      <Image
        source={require('../../assets/sera_logo.png')}
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.22),
        }}
        resizeMode="contain"
      />

      {(showText || showTagline) && (
        <View
          style={[
            direction === 'column' ? styles.textColumn : styles.textRow,
          ]}
        >
          {showText && (
            <AppText
              variant="cardTitle"
              style={[
                styles.brandName,
                { color: colors.textPrimary },
                textStyle,
              ]}
            >
              SERA
            </AppText>
          )}
          {showTagline && (
            <AppText
              variant="metadata"
              style={[
                styles.tagline,
                { color: colors.textSecondary },
              ]}
              numberOfLines={2}
            >
              {tagline}
            </AppText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  badgeCircle: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  symbol: {
    fontWeight: '800',
    fontFamily: 'Courier',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  textRow: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  textColumn: {
    marginTop: 8,
    alignItems: 'center',
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 16,
    fontFamily: 'Courier',
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
