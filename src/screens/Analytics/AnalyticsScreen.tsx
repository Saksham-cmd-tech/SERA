import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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
  const { transactions, financialSummary, insights } = useTransactionStore();
  const categories = useCategoryStore(state => state.categories);
  const { netWorth } = useAccountStore();

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

  // Monthly cash flow dummy comparison for minimal bar display
  const monthlyFlow = [
    { month: 'MAY', income: 72000, expense: 38000 },
    { month: 'JUN', income: 75000, expense: 41000 },
    { month: 'JUL', income: 78000, expense: 39500 },
    { month: 'AUG', income: 82000, expense: 44000 },
    { month: 'SEP', income: 85000, expense: 42350 },
  ];

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
        {/* Dominant Headline: September Spending */}
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
            SEPTEMBER SPENDING
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 2 }}
          >
            {formatCurrency(financialSummary?.totalExpense || 42350, currencySymbol, isPrivacyMode, false)}
          </AppText>
          <AppText variant="metadata" style={{ color: colors.positive, marginTop: 4 }}>
            +8.4% compared to August • Savings rate: {financialSummary?.savingsRate || 50.1}%
          </AppText>

          {/* Minimalist Architectural Line Graph / Grid */}
          <FinanceGrid
            barsCount={32}
            height={50}
            minHeight={16}
            pattern="reference"
            lineWidth={1.5}
            lineSpacing={4}
            color={colors.gridLine}
            activeColor={colors.textPrimary}
            progress={0.78}
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
              const incomeHeight = (m.income / 90000) * 80;
              const expenseHeight = (m.expense / 90000) * 80;
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
