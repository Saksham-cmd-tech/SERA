import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';

interface MonthlyBudgetBannerProps {
  monthName: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  isOverrun?: boolean;
  overrunAmount?: number;
  overrunCategory?: string;
  onPressDetails?: () => void;
}

export const MonthlyBudgetBanner: React.FC<MonthlyBudgetBannerProps> = ({
  monthName = 'CURRENT MONTH',
  totalBudget = 0,
  totalSpent = 0,
  totalRemaining = 0,
  isOverrun = false,
  overrunAmount = 0,
  overrunCategory = '',
  onPressDetails,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();

  const spentRatio = totalBudget > 0 ? Math.min(1, Math.max(0, totalSpent / totalBudget)) : 0;
  const spentPercent = Math.round(spentRatio * 100);
  const isBudgetExceeded = isOverrun || (totalBudget > 0 && totalSpent > totalBudget);

  // Safe daily spend estimate (days left in month)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());
  const dailySafePace = Math.max(0, Math.round(totalRemaining / daysRemaining));

  return (
    <View style={[styles.wrapper, { marginBottom: spacing.md }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPressDetails}
        style={[
          styles.mainCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.md,
          },
        ]}
      >
        {/* Header Row: Month Budget label + Used % Chip */}
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isBudgetExceeded ? colors.accentRed : colors.positive },
              ]}
            />
            <AppText
              variant="label"
              style={{ color: colors.textPrimary, letterSpacing: 1.4, fontWeight: '700' }}
            >
              {monthName.toUpperCase()} BUDGET
            </AppText>
          </View>

          <View
            style={[
              styles.usedChip,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                borderRadius: radius.sm,
              },
            ]}
          >
            <AppText
              variant="metadata"
              style={{
                color: isBudgetExceeded ? colors.accentRed : colors.textPrimary,
                fontWeight: '700',
                fontSize: 11,
              }}
            >
              {isBudgetExceeded ? 'EXCEEDED' : `${spentPercent}% Used`}
            </AppText>
          </View>
        </View>

        {/* Large Prominent Figures: Spent / Total */}
        <View style={styles.amountComparisonRow}>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '800' }}
          >
            {formatCurrency(totalSpent, currencySymbol, isPrivacyMode, false)}
          </AppText>
          <AppText
            variant="label"
            privacySensitive
            style={{ color: colors.textSecondary, fontWeight: '600', marginLeft: 8, marginBottom: 4 }}
          >
            / {formatCurrency(totalBudget, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>

        {/* Flat Progress Bar (100% solid, zero gradient) */}
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: colors.cardDark, borderRadius: radius.full, height: 6, overflow: 'hidden' },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(3, spentPercent))}%`,
                backgroundColor: isBudgetExceeded ? colors.accentRed : colors.positive,
                borderRadius: radius.full,
                height: 6,
              },
            ]}
          />
        </View>

        {/* Footer Subtext: Remaining and Safe Daily Pace */}
        <View style={styles.footerRow}>
          <AppText
            variant="labelSmall"
            privacySensitive
            style={{
              color: isBudgetExceeded ? colors.accentRed : colors.positive,
              fontWeight: '700',
            }}
          >
            {isBudgetExceeded
              ? `Over by ${formatCurrency(overrunAmount || (totalSpent - totalBudget), currencySymbol, isPrivacyMode, false)}`
              : `${formatCurrency(totalRemaining, currencySymbol, isPrivacyMode, false)} left`}
          </AppText>

          {totalRemaining > 0 && !isBudgetExceeded && (
            <AppText variant="metadata" style={{ color: colors.textMuted, fontSize: 11 }}>
              {daysRemaining} days left • {formatCurrency(dailySafePace, currencySymbol, isPrivacyMode, false)}/day
            </AppText>
          )}
        </View>
      </TouchableOpacity>

      {/* Clean Budget Notice Alert (if exceeded) */}
      {isBudgetExceeded && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressDetails}
          style={[
            styles.noticeCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
              borderLeftColor: colors.accentRed,
              borderLeftWidth: 4,
              borderRadius: radius.md,
              padding: spacing.sm + 2,
              marginTop: spacing.xs,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CategoryIcon name="AlertTriangle" size={14} color={colors.accentRed} strokeWidth={2.4} />
            <AppText
              variant="labelSmall"
              style={{ color: colors.textPrimary, fontWeight: '700', marginLeft: 6 }}
            >
              Budget Warning
            </AppText>
          </View>
          <AppText
            variant="metadata"
            style={{ color: colors.textSecondary, marginTop: 4, fontSize: 11 }}
          >
            {overrunCategory
              ? `${overrunCategory} exceeded budget limit by ${formatCurrency(overrunAmount, currencySymbol, isPrivacyMode, false)}.`
              : `Overall monthly budget limit has been exceeded.`}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  mainCard: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    marginRight: 6,
  },
  usedChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  amountComparisonRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 7,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  noticeCard: {
    borderWidth: 1,
  },
});
