import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { FinanceGrid } from '../../components/common/FinanceGrid';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatCurrency } from '../../utils/currency';
import { formatMonthYear } from '../../utils/date';

interface BudgetsScreenProps {
  navigation: any;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { summary, loadBudgetSummary, isLoading } = useBudgetStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBudgetSummary();
    }, [loadBudgetSummary])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgetSummary();
    setRefreshing(false);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header
          subtitle={formatMonthYear()}
          title="Monthly Budget"
          rightAction={
            <TouchableOpacity
              onPress={() => navigation.navigate('AddBudgetCategory')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.plusIconBtn, { backgroundColor: colors.cardDark }]}
            >
              <CategoryIcon name="Plus" size={16} color={colors.textInverted} strokeWidth={2.2} />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary}
          />
        }
      >
        {/* Main Budget Summary Block with Visual Rhythm Grid */}
        <View
          style={[
            styles.summaryBlock,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
                TOTAL BUDGET
              </AppText>
              <AppText
                variant="displayMedium"
                privacySensitive
                style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 2 }}
              >
                {formatCurrency(summary?.totalBudget ?? 0, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </View>

            <FinanceGrid
              barsCount={18}
              height={44}
              minHeight={14}
              pattern="uniform"
              lineWidth={1}
              lineSpacing={3}
              color={colors.gridLine}
              activeColor={summary?.isOverrun ? colors.coral : colors.textPrimary}
              progress={(summary?.percentageUsed ?? 0) / 100}
            />
          </View>

          {/* Used & Remaining Metrics */}
          <View style={[styles.statsRow, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.sm }]}>
            <View>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                USED ({summary?.percentageUsed ?? 0}%)
              </AppText>
              <AppText
                variant="amountSmall"
                privacySensitive
                style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 2 }}
              >
                {formatCurrency(summary?.totalSpent ?? 0, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                REMAINING
              </AppText>
              <AppText
                variant="amountSmall"
                privacySensitive
                style={{
                  color: (summary?.totalRemaining ?? 0) < 0 ? colors.coral : colors.positive,
                  fontWeight: '700',
                  marginTop: 2,
                }}
              >
                {formatCurrency(summary?.totalRemaining ?? 0, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Section Heading & Category Budgets */}
        <View style={styles.sectionHeaderRow}>
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
            CATEGORY ALLOCATIONS
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('AddBudgetCategory')}>
            <AppText variant="labelSmall" style={{ color: colors.textPrimary, fontWeight: '700' }}>
              + ALLOCATE
            </AppText>
          </TouchableOpacity>
        </View>

        {summary?.categoryAnalysis?.map(cat => {
          return (
            <View
              key={cat.categoryId}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: cat.isOverrun ? colors.coral : colors.surface,
                  borderColor: cat.isOverrun ? colors.coral : colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              {/* Category Header */}
              <View style={styles.catHeaderRow}>
                <View style={styles.catHeaderLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: cat.isOverrun ? 'rgba(255, 255, 255, 0.25)' : colors.cardDark,
                        borderRadius: radius.xs,
                      },
                    ]}
                  >
                    <CategoryIcon
                      name={cat.categoryIcon}
                      size={14}
                      color={cat.isOverrun ? '#FFFFFF' : colors.textInverted}
                    />
                  </View>
                  <AppText
                    variant="label"
                    style={{
                      color: cat.isOverrun ? '#FFFFFF' : colors.textPrimary,
                      letterSpacing: 1.4,
                      marginLeft: 8,
                      fontWeight: '700',
                    }}
                  >
                    {cat.categoryName.toUpperCase()}
                  </AppText>
                </View>

                {cat.isOverrun && (
                  <View style={styles.overrunPill}>
                    <AppText
                      variant="labelSmall"
                      style={{ color: '#FFFFFF', fontWeight: '700', letterSpacing: 1 }}
                    >
                      OVERRUN +{formatCurrency(cat.overrunAmount, currencySymbol, isPrivacyMode, false)}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Amounts and Progress Bar */}
              <View style={[styles.amountsRow, { marginTop: spacing.sm }]}>
                <AppText
                  variant="amountSmall"
                  privacySensitive
                  style={{
                    color: cat.isOverrun ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: '700',
                  }}
                >
                  {formatCurrency(cat.spentAmount, currencySymbol, isPrivacyMode, false)}
                  <AppText
                    variant="metadata"
                    style={{
                      color: cat.isOverrun ? '#FFDCD1' : colors.textSecondary,
                      fontWeight: '400',
                    }}
                  >
                    {' '}/ {formatCurrency(cat.limitAmount, currencySymbol, isPrivacyMode, false)}
                  </AppText>
                </AppText>

                <AppText
                  variant="label"
                  style={{
                    color: cat.isOverrun ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: '700',
                  }}
                >
                  {cat.percentage}%
                </AppText>
              </View>

              {/* Architectural thin bar */}
              <View
                style={[
                  styles.barTrack,
                  {
                    backgroundColor: cat.isOverrun
                      ? 'rgba(255, 255, 255, 0.3)'
                      : colors.borderLight,
                    marginTop: 6,
                  },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: cat.isOverrun ? '#FFFFFF' : colors.cardDark,
                      width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}

        {/* Action Button: Add Budget Category */}
        <AppButton
          title="+ ADD BUDGET CATEGORY"
          onPress={() => navigation.navigate('AddBudgetCategory')}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.md, marginBottom: 30 }}
        />
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
  plusIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBlock: {
    borderWidth: 1,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  categoryCard: {
    borderWidth: 1,
  },
  catHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overrunPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  barTrack: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
