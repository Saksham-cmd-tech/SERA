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
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.highlightedCard,
          {
            backgroundColor: colors.surfaceCard,
            borderColor: colors.borderLight,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: radius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <View style={styles.topRow}>
          <AppText
            variant="sectionHeading"
            style={{ color: colors.textSecondary }}
          >
            TARGET CATEGORY
          </AppText>
          <View
            style={[
              styles.selectedBadge,
              {
                backgroundColor: colors.surfaceLighter,
                borderRadius: radius.full,
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{ color: colors.textPrimary, fontWeight: '600' }}
            >
              Selected
            </AppText>
          </View>
        </View>

        {/* Center Name & Amount */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressPlus || onPress}
          style={styles.centerContent}
        >
          <AppText
            variant="cardTitle"
            style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 4 }}
          >
            {name}
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.accentRed, fontWeight: '700' }}
          >
            {formatCurrency(amount, currencySymbol, isPrivacyMode, false)}
          </AppText>
          <AppText
            variant="metadata"
            style={{ color: colors.textMuted, marginTop: 4 }}
          >
            Tap keypad below to edit limit
          </AppText>
        </TouchableOpacity>

        {/* Bottom row */}
        <View
          style={[
            styles.bottomRow,
            {
              borderTopColor: colors.borderLight,
              borderTopWidth: StyleSheet.hairlineWidth,
              paddingTop: spacing.sm,
            },
          ]}
        >
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 0.5, fontWeight: '600' }}>
            MONTHLY CAP
          </AppText>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '600' }}
          >
            {formatCurrency(amount, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  }

  // Grouped row
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.darkRowCard,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.md,
          paddingVertical: spacing.sm + 4,
          paddingHorizontal: spacing.md,
          marginBottom: spacing.xs,
        },
      ]}
    >
      <AppText
        variant="bodyMedium"
        style={{ color: colors.textPrimary, fontWeight: '600' }}
      >
        {name}
      </AppText>

      <AppText
        variant="amountSmall"
        privacySensitive
        style={{ color: colors.textSecondary, fontWeight: '600' }}
      >
        {isAddMode && amount === 0
          ? `${currencySymbol}0`
          : formatCurrency(amount, currencySymbol, isPrivacyMode, false)}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  highlightedCard: {
    minHeight: 180,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
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
