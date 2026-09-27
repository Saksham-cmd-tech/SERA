import React, { useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { FinanceGrid } from '../../components/common/FinanceGrid';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import { formatCurrency } from '../../utils/currency';
import { formatMonthYear } from '../../utils/date';

interface AnalyticsScreenProps {
  navigation: any;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { transactions, financialSummary, insights, loadTransactions } = useTransactionStore();
  const categories = useCategoryStore(state => state.categories);
  const { netWorth, loadAccounts } = useAccountStore();

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadAccounts();
    }, [loadTransactions, loadAccounts])
  );

  // Category breakdown calculations
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExpense = 0;

    for (const tx of transactions) {
      if (tx.type === 'expense') {
        totals[tx.categoryId] = (totals[tx.categoryId] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    }

    return Object.entries(totals)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return {
          catId,
          name: cat ? cat.name : 'Other',
          amount,
          percentage,
          color: cat ? cat.color : colors.cardDark,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, colors]);

  // Monthly cash flow dynamically derived from recorded transactions
  const monthlyFlow = useMemo(() => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    const result = [];

    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const monthPrefix = `${year}-${String(monthNum).padStart(2, '0')}`;
      const monthName = monthNames[d.getMonth()];

      let income = 0;
      let expense = 0;

      for (const tx of transactions) {
        if (tx.date.startsWith(monthPrefix)) {
          if (tx.type === 'income') income += tx.amount;
          else if (tx.type === 'expense') expense += tx.amount;
        }
      }

      result.push({
        month: monthName,
        income,
        expense,
      });
    }

    return result;
  }, [transactions]);

  const maxFlowAmount = useMemo(() => {
    const maxVal = Math.max(0, ...monthlyFlow.map(m => Math.max(m.income, m.expense)));
    return maxVal > 0 ? maxVal : 1;
  }, [monthlyFlow]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header showBack onPressBack={() => navigation.goBack()} subtitle={formatMonthYear()} title="Financial Analytics" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dominant Headline: Spending */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
            {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()} SPENDING
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 2 }}
          >
            {formatCurrency(financialSummary?.totalExpense ?? 0, currencySymbol, isPrivacyMode, false)}
          </AppText>
          <AppText variant="metadata" style={{ color: colors.positive, marginTop: 4 }}>
            Savings rate: {financialSummary?.savingsRate ?? 0}% • Income: {formatCurrency(financialSummary?.totalIncome ?? 0, currencySymbol, isPrivacyMode, false)}
          </AppText>

          {/* Minimalist Architectural Line Graph / Grid */}
          <FinanceGrid
            barsCount={32}
            height={50}
            minHeight={16}
            pattern="uniform"
            lineWidth={1.5}
            lineSpacing={4}
            activeColor={colors.textPrimary}
            progress={
              (financialSummary?.totalIncome ?? 0) > 0
                ? Math.min(1, (financialSummary?.totalExpense ?? 0) / (financialSummary?.totalIncome ?? 1))
                : (financialSummary?.totalExpense ?? 0) > 0 ? 1 : 0
            }
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Calculated Insights Section (Requirement 24) */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 8 }}>
          CALCULATED INSIGHTS
        </AppText>

        <View style={{ marginBottom: spacing.md }}>
          {insights.map(item => (
            <View
              key={item.id}
              style={[
                styles.insightCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: item.type === 'warning' ? colors.coral : colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: 8,
                },
              ]}
            >
              <View style={styles.insightHeaderRow}>
                <AppText
                  variant="labelSmall"
                  style={{
                    color: item.type === 'warning' ? colors.coral : colors.textSecondary,
                    letterSpacing: 1.4,
                    fontWeight: '700',
                  }}
                >
                  {item.title}
                </AppText>
                {item.metric && (
                  <AppText
                    variant="label"
                    privacySensitive
                    style={{
                      color: item.type === 'warning' ? colors.coral : colors.textPrimary,
                      fontWeight: '700',
                    }}
                  >
                    {item.metric}
                  </AppText>
                )}
              </View>
              <AppText variant="bodyMedium" style={{ color: colors.textPrimary, marginTop: 4 }}>
                {item.description}
              </AppText>
            </View>
          ))}
        </View>

        {/* Monthly Cash Flow Trend (Minimal Bar Visualization) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
            5-MONTH CASH FLOW TREND
          </AppText>
          <View style={styles.barChartContainer}>
            {monthlyFlow.map(m => {
              const incomeHeight = m.income > 0 ? Math.max(4, (m.income / maxFlowAmount) * 80) : 0;
              const expenseHeight = m.expense > 0 ? Math.max(4, (m.expense / maxFlowAmount) * 80) : 0;
              return (
                <View key={m.month} style={styles.chartCol}>
                  <View style={styles.barsPair}>
                    <View
                      style={[
                        styles.barItem,
                        { height: incomeHeight, backgroundColor: colors.positive, width: 7 },
                      ]}
                    />
                    <View
                      style={[
                        styles.barItem,
                        { height: expenseHeight, backgroundColor: colors.coral, width: 7, marginLeft: 2 },
                      ]}
                    />
                  </View>
                  <AppText variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 6, fontSize: 9 }}>
                    {m.month}
                  </AppText>
                </View>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.positive }]} />
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginLeft: 4 }}>
                Income
              </AppText>
            </View>
            <View style={[styles.legendItem, { marginLeft: 16 }]}>
              <View style={[styles.legendDot, { backgroundColor: colors.coral }]} />
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginLeft: 4 }}>
                Expenses
              </AppText>
            </View>
          </View>
        </View>

        {/* Category Breakdown Progress Bars */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 12 }}>
            CATEGORY OUTFLOW BREAKDOWN
          </AppText>

          {categoryBreakdown.slice(0, 6).map(item => (
            <View key={item.catId} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="bodyMedium" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {item.name}
                </AppText>
                <AppText
                  variant="amountSmall"
                  privacySensitive
                  style={{ color: colors.textPrimary, fontWeight: '700' }}
                >
                  {formatCurrency(item.amount, currencySymbol, isPrivacyMode, false)}{' '}
                  <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                    ({item.percentage}%)
                  </AppText>
                </AppText>
              </View>

              <View
                style={[
                  styles.categoryBarTrack,
                  { backgroundColor: colors.borderLight, marginTop: 4 },
                ]}
              >
                <View
                  style={[
                    styles.categoryBarFill,
                    {
                      backgroundColor: colors.cardDark,
                      width: `${Math.min(100, Math.max(2, item.percentage))}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Net Worth Quick Link */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Accounts')}
          style={[
            styles.netWorthBanner,
            {
              backgroundColor: colors.cardDark,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: 40,
            },
          ]}
        >
          <View>
            <AppText variant="labelSmall" style={{ color: colors.textMuted }}>
              NET FINANCIAL POSITION
            </AppText>
            <AppText
              variant="amountMedium"
              privacySensitive
              style={{ color: colors.textInverted, fontWeight: '700', marginTop: 2 }}
            >
              {formatCurrency(netWorth.netWorth, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>
          <AppText variant="labelSmall" style={{ color: colors.accent, fontWeight: '700' }}>
            VIEW ACCOUNTS ↗
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerWrap: {
    paddingBottom: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
  },
  insightCard: {
    borderWidth: 1,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  chartCol: {
    alignItems: 'center',
  },
  barsPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barItem: {
    borderRadius: 1,
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryBarTrack: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
  },
  netWorthBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
});
