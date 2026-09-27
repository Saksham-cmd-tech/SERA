import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
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
  size = 40,
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
      <View
        style={[
          styles.badgeCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: circleBg,
            borderColor: colors.border,
          },
        ]}
      >
        <AppText
          style={[
            styles.symbol,
            {
              color: symbolColor,
              fontSize: size * 0.54,
              lineHeight: size * 0.64,
            },
          ]}
        >
          $
        </AppText>
      </View>

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
