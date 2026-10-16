import React, { useState, useCallback, useMemo } from 'react';
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
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { Header } from '../../components/navigation/Header';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatCurrency } from '../../utils/currency';
import { formatMonthYear } from '../../utils/date';

interface BudgetsScreenProps {
  navigation: any;
}

type BudgetFilter = 'ALL' | 'NEAR_LIMIT' | 'ON_TRACK';

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { summary, loadBudgetSummary, isLoading } = useBudgetStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BudgetFilter>('ALL');

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

  // Safe pace calculations
  const { daysLeft, dailySafePace } = useMemo(() => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, lastDayOfMonth - now.getDate());
    const remaining = summary?.totalRemaining ?? 0;
    const pace = remaining > 0 ? Math.round(remaining / remainingDays) : 0;
    return { daysLeft: remainingDays, dailySafePace: pace };
  }, [summary?.totalRemaining]);

  // Counts for filter pills
  const categories = summary?.categoryAnalysis ?? [];
  const nearLimitCount = useMemo(
    () => categories.filter(c => c.isOverrun || c.percentage >= 80).length,
    [categories]
  );
  const onTrackCount = useMemo(
    () => categories.filter(c => !c.isOverrun && c.percentage < 80).length,
    [categories]
  );

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (activeFilter === 'NEAR_LIMIT') {
      return categories.filter(c => c.isOverrun || c.percentage >= 80);
    }
    if (activeFilter === 'ON_TRACK') {
      return categories.filter(c => !c.isOverrun && c.percentage < 80);
    }
    return categories;
  }, [activeFilter, categories]);

  // Find highest risk category for the Notice box
  const highestRiskCat = useMemo(() => {
    if (categories.length === 0) return null;
    return [...categories].sort((a, b) => b.percentage - a.percentage)[0];
  }, [categories]);

  const totalBudget = summary?.totalBudget ?? 0;
  const totalSpent = summary?.totalSpent ?? 0;
  const totalRemaining = summary?.totalRemaining ?? 0;
  const percentageUsed = summary?.percentageUsed ?? 0;
  const isOverrun = summary?.isOverrun ?? false;

  const totalStatusColor = isOverrun
    ? colors.accentRed
    : percentageUsed >= 80
    ? colors.warning
    : colors.positive;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Edge-to-edge Clean Technical Header */}
      <Header
        subtitle={formatMonthYear()}
        title="Budgets & Limits"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddBudgetCategory')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.addBudgetBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            <CategoryIcon name="Plus" size={16} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.md },
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
        {/* Master Monthly Overview Card (Stitch: rounded-xl, #111822) */}
        <View
          style={[
            styles.masterCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md + 2,
              marginTop: spacing.sm,
              marginBottom: spacing.md,
            },
          ]}
        >
          {/* Header Row */}
          <View style={styles.masterTopRow}>
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 1.2, fontWeight: '600' }}
            >
              TOTAL MONTHLY BUDGET
            </AppText>
            <View
              style={[
                styles.spentPill,
                {
                  backgroundColor: colors.cardDark,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                },
              ]}
            >
              <View
                style={[
                  styles.spentDot,
                  { backgroundColor: totalStatusColor },
                ]}
              />
              <AppText
                variant="labelSmall"
                style={{
                  color: colors.textPrimary,
                  fontWeight: '600',
                }}
              >
                {percentageUsed}% Spent
              </AppText>
            </View>
          </View>

          {/* Amount Display */}
          <View style={styles.masterAmountRow}>
            <AppText
              variant="displayMedium"
              privacySensitive
              style={{ color: colors.textPrimary, fontWeight: '700' }}
            >
              {formatCurrency(totalSpent, currencySymbol, isPrivacyMode, false)}
            </AppText>
            <AppText
              variant="amountSmall"
              privacySensitive
              style={{ color: colors.textSecondary, marginLeft: 8 }}
            >
              / {formatCurrency(totalBudget, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>

          {/* Solid Full-Rounded Progress Bar */}
          <View
            style={[
              styles.masterBarTrack,
              {
                backgroundColor: colors.cardDark,
                borderRadius: radius.full,
              },
            ]}
          >
            <View
              style={[
                styles.masterBarFill,
                {
                  backgroundColor: totalStatusColor,
                  borderRadius: radius.full,
                  width: `${Math.min(100, Math.max(0, percentageUsed))}%`,
                },
              ]}
            />
          </View>

          {/* Bottom Split Metrics */}
          <View
            style={[
              styles.masterBottomSplit,
              { borderTopColor: colors.border, borderTopWidth: 1 },
            ]}
          >
            <View>
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 0.8 }}
              >
                REMAINING
              </AppText>
              <AppText
                variant="amountSmall"
                privacySensitive
                style={{
                  color: totalRemaining < 0 ? colors.accentRed : colors.positive,
                  fontWeight: '700',
                  marginTop: 2,
                }}
              >
                {formatCurrency(totalRemaining, currencySymbol, isPrivacyMode, false)} Left
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 0.8 }}
              >
                DAILY SAFE PACE
              </AppText>
              <AppText
                variant="labelSmall"
                privacySensitive
                style={{
                  color: colors.textPrimary,
                  fontWeight: '600',
                  marginTop: 2,
                }}
              >
                {formatCurrency(dailySafePace, currencySymbol, isPrivacyMode, false)}/day{' '}
                <AppText style={{ color: colors.textMuted }}>• {daysLeft} days left</AppText>
              </AppText>
            </View>
          </View>
        </View>

        {/* Filter Segmented Navigation (Stitch: rounded-lg p-1 flex gap-1) */}
        <View
          style={[
            styles.filterSegment,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderRadius: radius.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('ALL')}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === 'ALL' ? colors.surfaceCard : 'transparent',
                borderColor: activeFilter === 'ALL' ? colors.accentRed : 'transparent',
                borderRadius: radius.sm,
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{
                color: activeFilter === 'ALL' ? colors.textPrimary : colors.textSecondary,
                fontWeight: activeFilter === 'ALL' ? '700' : '500',
              }}
            >
              All ({categories.length})
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('NEAR_LIMIT')}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === 'NEAR_LIMIT' ? colors.surfaceCard : 'transparent',
                borderColor: activeFilter === 'NEAR_LIMIT' ? colors.accentRed : 'transparent',
                borderRadius: radius.sm,
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{
                color: activeFilter === 'NEAR_LIMIT' ? colors.textPrimary : colors.warning,
                fontWeight: activeFilter === 'NEAR_LIMIT' ? '700' : '500',
              }}
            >
              Near Limit ({nearLimitCount})
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('ON_TRACK')}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === 'ON_TRACK' ? colors.surfaceCard : 'transparent',
                borderColor: activeFilter === 'ON_TRACK' ? colors.accentRed : 'transparent',
                borderRadius: radius.sm,
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{
                color: activeFilter === 'ON_TRACK' ? colors.textPrimary : colors.positive,
                fontWeight: activeFilter === 'ON_TRACK' ? '700' : '500',
              }}
            >
              On Track ({onTrackCount})
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Spend Alert Notice Box (Stitch: border-l-4 border-l-[#EB3B2E] rounded-lg p-3.5) */}
        {highestRiskCat && (
          <View
            style={[
              styles.noticeBox,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                borderLeftColor:
                  highestRiskCat.isOverrun || highestRiskCat.percentage >= 80
                    ? colors.accentRed
                    : colors.positive,
                borderRadius: radius.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <CategoryIcon
              name="AlertTriangle"
              size={18}
              color={
                highestRiskCat.isOverrun || highestRiskCat.percentage >= 80
                  ? colors.accentRed
                  : colors.positive
              }
            />
            <View style={styles.noticeContent}>
              <AppText
                variant="cardTitle"
                style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '700' }}
              >
                Budget Notice
              </AppText>
              <AppText
                variant="bodyMedium"
                style={{ color: colors.textSecondary, marginTop: 2, lineHeight: 18 }}
              >
                {highestRiskCat.isOverrun ? (
                  <>
                    <AppText style={{ color: colors.textPrimary, fontWeight: '600' }}>
                      {highestRiskCat.categoryName}
                    </AppText>{' '}
                    is{' '}
                    <AppText style={{ color: colors.accentRed, fontWeight: '600' }}>
                      OVERRUN
                    </AppText>{' '}
                    by{' '}
                    <AppText style={{ color: colors.accentRed, fontWeight: '600' }}>
                      {formatCurrency(highestRiskCat.overrunAmount, currencySymbol, isPrivacyMode, false)}
                    </AppText>
                    . Consider reallocating limits.
                  </>
                ) : highestRiskCat.percentage >= 80 ? (
                  <>
                    <AppText style={{ color: colors.textPrimary, fontWeight: '600' }}>
                      {highestRiskCat.categoryName}
                    </AppText>{' '}
                    is at{' '}
                    <AppText style={{ color: colors.warning, fontWeight: '600' }}>
                      {highestRiskCat.percentage}%
                    </AppText>{' '}
                    of monthly cap. Safe daily limit is{' '}
                    <AppText style={{ color: colors.accentRed, fontWeight: '600' }}>
                      {formatCurrency(
                        Math.max(0, Math.round(highestRiskCat.remainingAmount / daysLeft)),
                        currencySymbol,
                        isPrivacyMode,
                        false
                      )}
                      /day
                    </AppText>
                    .
                  </>
                ) : (
                  <>
                    All categories are currently on track. Safe total discretionary pace is{' '}
                    <AppText style={{ color: colors.positive, fontWeight: '600' }}>
                      {formatCurrency(dailySafePace, currencySymbol, isPrivacyMode, false)}/day
                    </AppText>
                    .
                  </>
                )}
              </AppText>
            </View>
          </View>
        )}

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <AppText
            variant="label"
            style={{ color: colors.textSecondary, letterSpacing: 1.2, fontWeight: '600' }}
          >
            ALLOCATED CATEGORIES
          </AppText>
          <AppText variant="labelSmall" style={{ color: colors.textMuted }}>
            Sorted by Risk
          </AppText>
        </View>

        {/* Category Budget Cards Stack (Stitch: rounded-xl, #111822) */}
        {filteredCategories.map(cat => {
          const catOverrun = cat.isOverrun;
          const catNearLimit = !catOverrun && cat.percentage >= 80;
          const statusColor = catOverrun
            ? colors.accentRed
            : catNearLimit
            ? colors.warning
            : colors.positive;
          const statusText = catOverrun ? 'Overrun' : catNearLimit ? 'Near Limit' : 'On Track';

          return (
            <View
              key={cat.categoryId}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: catOverrun ? colors.accentRed : colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm + 2,
                },
              ]}
            >
              {/* Category Header Row */}
              <View style={styles.catHeaderRow}>
                <View style={styles.catHeaderLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: colors.cardDark,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <CategoryIcon
                      name={cat.categoryIcon}
                      size={16}
                      color={colors.textPrimary}
                    />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <AppText
                      variant="cardTitle"
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      {cat.categoryName}
                    </AppText>
                    <AppText
                      variant="metadata"
                      style={{ color: colors.textSecondary, marginTop: 1 }}
                    >
                      Limit: {formatCurrency(cat.limitAmount, currencySymbol, isPrivacyMode, false)}
                    </AppText>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.catBadge,
                    {
                      backgroundColor: colors.cardDark,
                      borderColor: colors.border,
                      borderRadius: radius.xs,
                    },
                  ]}
                >
                  <View style={[styles.catBadgeDot, { backgroundColor: statusColor }]} />
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: statusColor,
                      fontWeight: '600',
                      fontSize: 11,
                    }}
                  >
                    {statusText}
                  </AppText>
                </View>
              </View>

              {/* Amounts Row */}
              <View style={styles.amountsRow}>
                <AppText
                  variant="amountSmall"
                  privacySensitive
                  style={{
                    color: colors.textPrimary,
                    fontWeight: '700',
                  }}
                >
                  {formatCurrency(cat.spentAmount, currencySymbol, isPrivacyMode, false)}{' '}
                  <AppText style={{ color: colors.textMuted, fontSize: 12 }}>used</AppText>
                </AppText>

                <AppText
                  variant="labelSmall"
                  style={{
                    color: statusColor,
                    fontWeight: '700',
                  }}
                >
                  {cat.percentage}%
                </AppText>
              </View>

              {/* Solid Rounded Progress Bar */}
              <View
                style={[
                  styles.catBarTrack,
                  {
                    backgroundColor: colors.cardDark,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <View
                  style={[
                    styles.catBarFill,
                    {
                      backgroundColor: statusColor,
                      borderRadius: radius.full,
                      width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                    },
                  ]}
                />
              </View>

              {/* Bottom Exhausted / Remaining Row */}
              <View style={styles.catFooterRow}>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  {cat.percentage}% exhausted
                </AppText>
                <AppText
                  variant="metadata"
                  privacySensitive
                  style={{
                    color: cat.remainingAmount < 0 ? colors.accentRed : colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  {formatCurrency(cat.remainingAmount, currencySymbol, isPrivacyMode, false)} remaining
                </AppText>
              </View>
            </View>
          );
        })}

        {/* Action Button: Add Budget Category */}
        <AppButton
          title="+ ALLOCATE NEW CATEGORY"
          onPress={() => navigation.navigate('AddBudgetCategory')}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.sm, marginBottom: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  addBudgetBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  masterCard: {
    borderWidth: 1,
    gap: 12,
  },
  masterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spentPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  masterAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  masterBarTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  masterBarFill: {
    height: '100%',
  },
  masterBottomSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  filterSegment: {
    borderWidth: 1,
    padding: 3,
    flexDirection: 'row',
    gap: 4,
  },
  filterTab: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBox: {
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noticeContent: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  categoryCard: {
    borderWidth: 1,
    gap: 10,
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
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadge: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  catBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  catBarTrack: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
  },
  catFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

