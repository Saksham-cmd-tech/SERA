import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';

interface BalanceCardProps {
  totalBalance: number;
  selectedAccountName: string;
  accountCount?: number;
  inflow?: number;
  outflow?: number;
  onPressAccountSwitcher?: () => void;
  onTogglePrivacy?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  selectedAccountName,
  accountCount,
  inflow,
  outflow,
  onPressAccountSwitcher,
  onTogglePrivacy,
}) => {
  const { colors, spacing, radius, isPrivacyMode, currencySymbol } = useAppTheme();

  const isAllAccounts = !selectedAccountName || selectedAccountName.toUpperCase() === 'ALL ACCOUNTS';
  const subtitle = isAllAccounts
    ? (accountCount ? `Consolidated across ${accountCount} active accounts` : 'Consolidated net balance')
    : `${selectedAccountName} • Active`;

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.lg,
          padding: 20,
          marginBottom: 16,
        },
      ]}
    >
      {/* Top Header Row: Label + Privacy Eye on Left, Account Pill on Right */}
      <View style={styles.topHeaderRow}>
        <View style={styles.labelGroup}>
          <AppText
            variant="label"
            style={{
              color: colors.textSecondary,
              letterSpacing: 0.5,
              fontWeight: '600',
              fontSize: 13,
            }}
          >
            Available Balance
          </AppText>
          <TouchableOpacity
            onPress={onTogglePrivacy}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.eyeButton}
          >
            <CategoryIcon
              name={isPrivacyMode ? 'EyeOff' : 'Eye'}
              size={15}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {onPressAccountSwitcher && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressAccountSwitcher}
            style={[
              styles.accountPill,
              {
                backgroundColor: colors.surfaceLighter,
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 14,
              },
            ]}
          >
            <View style={[styles.activeDot, { backgroundColor: colors.positive }]} />
            <AppText
              variant="labelSmall"
              style={{
                color: colors.textPrimary,
                letterSpacing: 0.2,
                marginRight: 4,
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {selectedAccountName}
            </AppText>
            <CategoryIcon name="ChevronDown" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dominant Balance Display */}
      <View style={styles.numberRow}>
        <AppText
          variant="displayLarge"
          privacySensitive
          style={[
            styles.dominantNumber,
            { color: colors.textPrimary, fontSize: 38, lineHeight: 46, letterSpacing: -0.8 },
          ]}
        >
          {formatCurrency(totalBalance, currencySymbol, isPrivacyMode, false)}
        </AppText>
      </View>

      {/* Subtitle / Account Context */}
      <AppText
        variant="metadata"
        style={{
          color: colors.textMuted,
          fontSize: 13,
          letterSpacing: 0.1,
          marginTop: 2,
        }}
      >
        {subtitle}
      </AppText>

      {/* Clean Inflow & Outflow Chips (Apple HIG Style) */}
      {(inflow !== undefined || outflow !== undefined) && (
        <View style={styles.flowRow}>
          {/* Inflow Chip */}
          <View
            style={[
              styles.flowChip,
              {
                backgroundColor: colors.surfaceLighter,
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: radius.sm,
              },
            ]}
          >
            <CategoryIcon name="ArrowUpRight" size={14} color={colors.positive} strokeWidth={2.4} />
            <AppText
              variant="labelSmall"
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: '600',
                marginLeft: 5,
              }}
            >
              Inflow
            </AppText>
            <AppText
              variant="labelSmall"
              privacySensitive
              style={{
                color: colors.positive,
                fontWeight: '700',
                fontSize: 13,
                marginLeft: 'auto',
              }}
            >
              +{formatCurrency(inflow || 0, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>

          {/* Outflow Chip */}
          <View
            style={[
              styles.flowChip,
              {
                backgroundColor: colors.surfaceLighter,
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: radius.sm,
              },
            ]}
          >
            <CategoryIcon name="ArrowDownLeft" size={14} color={colors.accentRed} strokeWidth={2.4} />
            <AppText
              variant="labelSmall"
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: '600',
                marginLeft: 5,
              }}
            >
              Outflow
            </AppText>
            <AppText
              variant="labelSmall"
              privacySensitive
              style={{
                color: colors.accentRed,
                fontWeight: '700',
                fontSize: 13,
                marginLeft: 'auto',
              }}
            >
              -{formatCurrency(outflow || 0, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyeButton: {
    padding: 4,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  dominantNumber: {
    fontWeight: '900',
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  flowChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
