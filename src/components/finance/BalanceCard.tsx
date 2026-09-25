import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';

interface BalanceCardProps {
  totalBalance: number;
  selectedAccountName: string;
  onPressAccountSwitcher?: () => void;
  onTogglePrivacy?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  selectedAccountName,
  onPressAccountSwitcher,
  onTogglePrivacy,
}) => {
  const { colors, spacing, radius, isPrivacyMode, currencySymbol } = useAppTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.md }]}>
      {/* Label and Privacy Toggle */}
      <View style={styles.labelRow}>
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 2 }}>
          AVAILABLE BALANCE
        </AppText>
        <TouchableOpacity
          onPress={onTogglePrivacy}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.eyeButton}
        >
          <CategoryIcon
            name={isPrivacyMode ? 'EyeOff' : 'Eye'}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Dominant Financial Display Number */}
      <View style={styles.numberRow}>
        <AppText
          variant="displayLarge"
          privacySensitive
          style={[styles.dominantNumber, { color: colors.textPrimary }]}
        >
          {formatCurrency(totalBalance, currencySymbol, isPrivacyMode, false)}
        </AppText>
      </View>

      {/* Account Switcher Pill */}
      {onPressAccountSwitcher && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressAccountSwitcher}
          style={[
            styles.accountPill,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              marginTop: spacing.sm,
            },
          ]}
        >
          <AppText
            variant="labelSmall"
            style={{ color: colors.textPrimary, letterSpacing: 1.4, marginRight: 6 }}
          >
            {selectedAccountName.toUpperCase()}
          </AppText>
          <CategoryIcon name="ChevronDown" size={12} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eyeButton: {
    marginLeft: 8,
    padding: 2,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dominantNumber: {
    fontWeight: '700',
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
