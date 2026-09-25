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
  totalSpent: _totalSpent = 0,
  totalRemaining = 0,
  isOverrun = false,
  overrunAmount = 0,
  overrunCategory = '',
  onPressDetails,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();

  return (
    <View style={[styles.wrapper, { marginBottom: spacing.lg }]}>
      {/* Top Main Budget Block */}
      <View
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

        {/* Budget Row with Vertical Rhythm Bars */}
        <View style={[styles.dataRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
          <View style={styles.dataColLeft}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
              BUDGET
            </AppText>
            <AppText
              variant="amountMedium"
              privacySensitive
              style={{ color: colors.textPrimary, marginTop: 2 }}
            >
              {formatCurrency(totalBudget, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>
          <View style={styles.gridColRight}>
            <FinanceGrid
              barsCount={20}
              height={38}
              minHeight={12}
              pattern="reference"
              lineWidth={1}
              lineSpacing={3}
              color={colors.gridLine}
              activeColor={colors.textPrimary}
              progress={0.7}
            />
          </View>
        </View>

        {/* Left Row with Lower Vertical Rhythm Bars */}
        <View style={[styles.dataRow, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.sm }]}>
          <View style={styles.dataColLeft}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
              LEFT
            </AppText>
            <AppText
              variant="amountMedium"
              privacySensitive
              style={{ color: colors.textPrimary, marginTop: 2 }}
            >
              {formatCurrency(totalRemaining, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>
          <View style={styles.gridColRight}>
            <FinanceGrid
              barsCount={16}
              height={26}
              minHeight={8}
              pattern="ascending"
              lineWidth={1}
              lineSpacing={3}
              color={colors.gridLine}
              activeColor={colors.textPrimary}
              progress={0.4}
            />
          </View>
        </View>
      </View>

      {/* Coral Warning Overrun Section */}
      {isOverrun && overrunAmount > 0 && (
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
                {overrunCategory.toUpperCase()}
              </AppText>
            </View>

            <FinanceGrid
              barsCount={14}
              height={28}
              minHeight={10}
              pattern="uniform"
              lineWidth={1}
              lineSpacing={3}
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
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  dataColLeft: {
    justifyContent: 'flex-end',
  },
  gridColRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
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
