import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { FinanceGrid } from '../common/FinanceGrid';
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
  const remainingRatio = totalBudget > 0 ? Math.max(0, Math.min(1, totalRemaining / totalBudget)) : 0;
  const isBudgetExceeded = isOverrun || (totalBudget > 0 && totalSpent > totalBudget);

  // When money has been spent, show at least 1 consumed bar on remaining (e.g. 17/18 active)
  const adjustedRemainingProgress = totalSpent > 0 && remainingRatio < 1
    ? Math.min(0.94, remainingRatio)
    : remainingRatio;

  return (
    <View style={[styles.wrapper, { marginBottom: spacing.lg }]}>
      {/* Top Main Budget Block matching reference media_1790320460288 */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPressDetails}
        style={[
          styles.mainCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.xs,
            padding: spacing.md,
          },
        ]}
      >
        <AppText
          variant="label"
          style={{ color: colors.textSecondary, letterSpacing: 1.8, marginBottom: 4 }}
        >
          AVAILABLE {monthName.toUpperCase()} BUDGET
        </AppText>

        <AppText
          variant="displayMedium"
          privacySensitive
          style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md }}
        >
          {formatCurrency(totalRemaining, currencySymbol, isPrivacyMode, false)}
        </AppText>

        {/* Budget Row: 'BUDGET' label on left, totalBudget amount on right */}
        <View style={styles.budgetRow}>
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.2 }}>
            BUDGET
          </AppText>
          <AppText
            variant="amountMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700' }}
          >
            {formatCurrency(totalBudget, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>

        {/* Full-width continuous horizontal hairline divider */}
        <View style={[styles.fullDivider, { backgroundColor: colors.border }]} />

        {/* Below Divider Split Section: Left info + shorter bars, Right tall vertical bars */}
        <View style={styles.splitSection}>
          {/* Left Column */}
          <View style={styles.leftCol}>
            <View style={styles.leftAmountRow}>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.2 }}>
                LEFT
              </AppText>
              <AppText
                variant="amountMedium"
                privacySensitive
                style={{
                  color: isBudgetExceeded ? colors.coral : colors.textPrimary,
                  fontWeight: '700',
                  marginLeft: 12,
                }}
              >
                {formatCurrency(totalRemaining, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </View>

            {/* Hairline sub-divider under LEFT */}
            <View style={[styles.subDivider, { backgroundColor: colors.border }]} />

            {/* Shorter Vertical Rhythm Bars (Remaining status) */}
            <FinanceGrid
              barsCount={18}
              height={36}
              pattern="uniform"
              lineWidth={1}
              lineSpacing={3.5}
              activeColor={isBudgetExceeded ? colors.coral : colors.textPrimary}
              progress={isBudgetExceeded ? 0 : adjustedRemainingProgress}
            />
          </View>

          {/* Right Column: Tall Vertical Rhythm Bars directly hanging from the top divider */}
          <View style={styles.rightCol}>
            <FinanceGrid
              barsCount={18}
              height={72}
              pattern="uniform"
              lineWidth={1}
              lineSpacing={3.5}
              activeColor={isBudgetExceeded ? colors.coral : colors.textPrimary}
              progress={isBudgetExceeded ? 1 : spentRatio}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Coral Warning Overrun Section from reference */}
      {isBudgetExceeded && overrunAmount > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressDetails}
          style={[
            styles.coralCard,
            {
              backgroundColor: colors.coral,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          {/* Top Overrun Header & Arrow Badge */}
          <View style={styles.coralTopRow}>
            <View style={styles.overrunBadgeRow}>
              <CategoryIcon name="AlertTriangle" size={14} color="#FFFFFF" />
              <AppText
                variant="labelSmall"
                style={{ color: '#FFFFFF', letterSpacing: 1.5, marginLeft: 6, fontWeight: '700' }}
              >
                BUDGET OVERRUN
              </AppText>
            </View>

            <View style={styles.arrowCircle}>
              <CategoryIcon name="ArrowUpRight" size={14} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          </View>

          {/* Overrun Value and Vertical Rhythm Bars */}
          <View style={styles.coralBottomRow}>
            <View>
              <AppText
                variant="amountLarge"
                privacySensitive
                style={{ color: '#FFFFFF', fontWeight: '700' }}
              >
                {formatCurrency(overrunAmount, currencySymbol, isPrivacyMode, false)}
              </AppText>
              <AppText
                variant="labelSmall"
                style={{ color: '#FFDCD1', letterSpacing: 1.4, marginTop: 2 }}
              >
                {overrunCategory ? overrunCategory.toUpperCase() : 'GENERAL OVERRUN'}
              </AppText>
            </View>

            <FinanceGrid
              barsCount={16}
              height={28}
              pattern="uniform"
              lineWidth={1}
              lineSpacing={3.5}
              color="rgba(255, 255, 255, 0.35)"
              activeColor="#FFFFFF"
              progress={1}
            />
          </View>
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
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 6,
  },
  fullDivider: {
    height: 1,
    width: '100%',
  },
  splitSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftCol: {
    justifyContent: 'flex-end',
  },
  leftAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  subDivider: {
    height: 1,
    width: '100%',
    marginBottom: 0,
  },
  rightCol: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  coralCard: {
    overflow: 'hidden',
  },
  coralTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overrunBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coralBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
