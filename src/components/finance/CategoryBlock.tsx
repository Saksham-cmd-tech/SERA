import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';

interface CategoryBlockProps {
  name: string;
  amount: number;
  spentAmount?: number;
  highlighted?: boolean;
  onPress?: () => void;
  onPressPlus?: () => void;
  isAddMode?: boolean;
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({
  name,
  amount,
  highlighted = false,
  onPress,
  onPressPlus,
  isAddMode = false,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();

  if (highlighted) {
    // Large warm yellow rectangular card inspired directly by Reference Screenshot 2
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.highlightedCard,
          {
            backgroundColor: colors.accent,
            borderRadius: radius.xs,
            padding: spacing.md,
          },
        ]}
      >
        <AppText
          variant="label"
          style={{ color: colors.accentText, letterSpacing: 1.8, fontWeight: '700' }}
        >
          {name.toUpperCase()}
        </AppText>

        {/* Center Gigantic '+' Sign */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressPlus || onPress}
          style={styles.plusContainer}
        >
          <CategoryIcon name="Plus" size={54} color={colors.accentText} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* Bottom row: BUDGET label on left, Amount on right */}
        <View style={styles.bottomRow}>
          <AppText variant="labelSmall" style={{ color: colors.accentText, letterSpacing: 1.4 }}>
            BUDGET
          </AppText>
          <AppText
            variant="amountMedium"
            privacySensitive
            style={{ color: colors.accentText, fontWeight: '700' }}
          >
            {formatCurrency(amount, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  }

  // Stacked dark olive-green horizontal rectangular block (Reference Screenshot 2)
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.darkRowCard,
        {
          backgroundColor: colors.cardDark,
          borderRadius: radius.xs,
          paddingVertical: spacing.md - 2,
          paddingHorizontal: spacing.md,
          marginBottom: spacing.xs,
        },
      ]}
    >
      <AppText
        variant="label"
        style={{ color: colors.textInverted, letterSpacing: 1.6, fontWeight: '600' }}
      >
        {name.toUpperCase()}
      </AppText>

      <AppText
        variant="amountSmall"
        privacySensitive
        style={{ color: colors.textInverted, fontWeight: '600' }}
      >
        {isAddMode && amount === 0
          ? `${currencySymbol}00.0`
          : formatCurrency(amount, currencySymbol, isPrivacyMode, false)}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  highlightedCard: {
    height: 190,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  plusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  darkRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
