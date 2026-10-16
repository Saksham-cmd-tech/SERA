import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { BalanceCard } from '../../components/finance/BalanceCard';
import { FinancialSummaryCards } from '../../components/finance/FinancialSummaryCards';
import { MonthlyBudgetBanner } from '../../components/finance/MonthlyBudgetBanner';
import { TransactionRow } from '../../components/finance/TransactionRow';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/currency';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();

  const {
    recentTransactions,
    financialSummary,
    loadTransactions,
    isLoading: isTxLoading,
  } = useTransactionStore();

  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    loadAccounts,
  } = useAccountStore();

  const { summary: budgetSummary, loadBudgetSummary } = useBudgetStore();
  const { goals, loadGoals } = useGoalStore();
  const { togglePrivacyMode, settings } = useSettingsStore();

  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadAccounts();
      loadBudgetSummary();
      loadGoals();
    }, [loadTransactions, loadAccounts, loadBudgetSummary, loadGoals])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadTransactions(),
      loadAccounts(),
      loadBudgetSummary(),
      loadGoals(),
    ]);
    setRefreshing(false);
  };

  const selectedAccount =
    selectedAccountId === 'all'
      ? null
      : accounts.find(a => a.id === selectedAccountId);

  const selectedAccountName = selectedAccount ? selectedAccount.name : 'ALL ACCOUNTS';
  const displayedBalance = selectedAccount
    ? selectedAccount.balance
    : financialSummary?.availableBalance || 0;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Top Application Bar */}
      <Header
        showAvatar
        avatarName={settings.userName || 'User'}
        onPressAvatar={() => navigation.navigate('MoreTab', { screen: 'Settings' })}
        subtitle={settings.userName ? `SERA • ${settings.userName.toUpperCase()}` : 'SERA • OVERVIEW'}
        title="Overview"
        showSeraMonogram
        showNotification
        onPressNotification={() => navigation.navigate('MoreTab', { screen: 'Settings' })}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isTxLoading}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary}
          />
        }
      >
        {/* Balance Card: Large Dominant Number & Clean Integrated Flow Chips */}
        <BalanceCard
          totalBalance={displayedBalance}
          selectedAccountName={selectedAccountName}
          accountCount={accounts.length}
          inflow={financialSummary?.totalIncome || 0}
          outflow={financialSummary?.totalExpense || 0}
          onPressAccountSwitcher={() => setAccountModalVisible(true)}
          onTogglePrivacy={togglePrivacyMode}
        />

        {/* Quick Action Buttons */}
        <View
          style={[
            styles.quickActionBar,
            {
              marginBottom: spacing.md,
              gap: 8,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddTransaction', { initialType: 'expense' })}
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: colors.accentRed,
                borderColor: colors.accentRed,
                borderRadius: radius.md,
              },
            ]}
          >
            <CategoryIcon name="Plus" size={15} color="#FFFFFF" strokeWidth={2.8} />
            <AppText
              variant="labelSmall"
              style={{ color: '#FFFFFF', letterSpacing: 0.8, marginLeft: 4, fontWeight: '700' }}
            >
              EXPENSE
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddTransaction', { initialType: 'income' })}
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <CategoryIcon name="Plus" size={15} color={colors.positive} strokeWidth={2.8} />
            <AppText
              variant="labelSmall"
              style={{ color: colors.positive, letterSpacing: 0.8, marginLeft: 4, fontWeight: '700' }}
            >
              INCOME
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MoreTab', { screen: 'Transfer' })}
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <CategoryIcon name="ArrowRightLeft" size={15} color={colors.textPrimary} strokeWidth={2.2} />
            <AppText
              variant="labelSmall"
              style={{ color: colors.textPrimary, letterSpacing: 0.8, marginLeft: 4, fontWeight: '700' }}
            >
              TRANSFER
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Monthly Budget Section (Stitch Screen 3 Layout) */}
        <MonthlyBudgetBanner
          monthName={budgetSummary?.monthName || new Date().toLocaleString('default', { month: 'long' }).toUpperCase()}
          totalBudget={budgetSummary?.totalBudget || settings.monthlyBudgetGoal || 0}
          totalSpent={budgetSummary?.totalSpent || 0}
          totalRemaining={budgetSummary?.totalRemaining || 0}
          isOverrun={budgetSummary?.isOverrun || false}
          overrunAmount={budgetSummary?.overrunAmount || 0}
          overrunCategory={budgetSummary?.overrunCategoryName || ''}
          onPressDetails={() => navigation.navigate('BudgetsTab')}
        />

        {/* Accounts Rail */}
        <View style={{ marginBottom: spacing.md }}>
          <View style={[styles.sectionHeaderRow, { marginBottom: 6 }]}>
            <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
              ACCOUNTS
            </AppText>
            <TouchableOpacity onPress={() => setAccountModalVisible(true)}>
              <AppText variant="labelSmall" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                SWITCH ↗
              </AppText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {/* 'ALL' Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedAccountId('all')}
              style={[
                styles.accountRailCard,
                {
                  backgroundColor: selectedAccountId === 'all' ? colors.surfaceCard : colors.surface,
                  borderColor: selectedAccountId === 'all' ? colors.accentRed : colors.border,
                  borderRadius: radius.md,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  minWidth: 120,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor: selectedAccountId === 'all' ? colors.positive : colors.cardDark,
                      marginRight: 6,
                    },
                  ]}
                />
                <AppText
                  variant="labelSmall"
                  style={{
                    color: selectedAccountId === 'all' ? colors.textPrimary : colors.textSecondary,
                    fontWeight: '700',
                    letterSpacing: 0.8,
                  }}
                  numberOfLines={1}
                >
                  ALL ACCOUNTS
                </AppText>
              </View>
              <AppText
                variant="bodyLarge"
                style={{
                  color: colors.textPrimary,
                  fontWeight: '700',
                }}
              >
                {isPrivacyMode ? '••••••' : formatCurrency(financialSummary?.availableBalance || 0, currencySymbol)}
              </AppText>
            </TouchableOpacity>

            {/* Individual Accounts */}
            {accounts.map(acc => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedAccountId(isSelected ? 'all' : acc.id)}
                  style={[
                    styles.accountRailCard,
                    {
                      backgroundColor: isSelected ? colors.surfaceCard : colors.surface,
                      borderColor: isSelected ? colors.accentRed : colors.border,
                      borderRadius: radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      minWidth: 130,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View
                      style={[
                        styles.activeDot,
                        {
                          backgroundColor: isSelected ? colors.positive : colors.cardDark,
                          marginRight: 6,
                        },
                      ]}
                    />
                    <AppText
                      variant="labelSmall"
                      style={{
                        color: isSelected ? colors.textPrimary : colors.textSecondary,
                        fontWeight: '700',
                        letterSpacing: 0.8,
                      }}
                      numberOfLines={1}
                    >
                      {acc.name.toUpperCase()}
                    </AppText>
                  </View>
                  <AppText
                    variant="bodyLarge"
                    style={{
                      color: colors.textPrimary,
                      fontWeight: '700',
                    }}
                  >
                    {isPrivacyMode ? '••••••' : formatCurrency(acc.balance, currencySymbol)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Monthly Overview Section */}
        <FinancialSummaryCards
          income={financialSummary?.totalIncome || 0}
          expenses={financialSummary?.totalExpense || 0}
          savings={financialSummary?.totalSavings || 0}
        />

        {/* Spending Category Breakdown Preview */}
        <View style={styles.sectionHeaderRow}>
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
            SPENDING BREAKDOWN
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <AppText variant="labelSmall" style={{ color: colors.textPrimary, fontWeight: '700' }}>
              ANALYTICS ↗
            </AppText>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.spendingBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          {budgetSummary?.categoryAnalysis && budgetSummary.categoryAnalysis.some(c => c.spentAmount > 0) ? (
            budgetSummary.categoryAnalysis
              .filter(c => c.spentAmount > 0)
              .slice(0, 3)
              .map((cat, idx) => (
                <View
                  key={cat.categoryId}
                  style={[
                    styles.spendingRow,
                    idx > 0 && { borderTopColor: colors.borderLight, borderTopWidth: 1 },
                  ]}
                >
                  <View style={styles.spendingLeft}>
                    <View
                      style={[
                        styles.spendingDot,
                        { backgroundColor: cat.isOverrun ? colors.coral : colors.positive },
                      ]}
                    />
                    <AppText
                      variant="cardTitle"
                      style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 8 }}
                    >
                      {cat.categoryName}
                    </AppText>
                  </View>
                  <AppText
                    variant="amountSmall"
                    privacySensitive
                    style={{
                      color: cat.isOverrun ? colors.coral : colors.textPrimary,
                      fontWeight: '700',
                    }}
                  >
                    {formatCurrency(cat.spentAmount, currencySymbol, isPrivacyMode, false)}
                  </AppText>
                </View>
              ))
          ) : (
            <View style={{ padding: spacing.md, alignItems: 'center' }}>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                No category expenses recorded this month yet.
              </AppText>
            </View>
          )}
        </View>

        {/* Savings Goals Preview */}
        {goals.length > 0 && (
          <View style={{ marginBottom: spacing.lg }}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
                SAVINGS GOALS
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('GoalsTab')}>
                <AppText variant="labelSmall" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  VIEW ALL ↗
                </AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('GoalsTab')}
              style={[
                styles.goalPreviewCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16 }}>
                  {goals[0].name}
                </AppText>
                <AppText
                  variant="amountSmall"
                  privacySensitive
                  style={{ color: colors.textPrimary, fontWeight: '700' }}
                >
                  {formatCurrency(goals[0].currentAmount, currencySymbol, isPrivacyMode, false)} / {formatCurrency(goals[0].targetAmount, currencySymbol, isPrivacyMode, false)}
                </AppText>
              </View>

              <View
                style={[
                  styles.goalBarTrack,
                  { backgroundColor: colors.borderLight, marginTop: 8 },
                ]}
              >
                <View
                  style={[
                    styles.goalBarFill,
                    {
                      backgroundColor: colors.accentRed,
                      width: `${Math.min(100, Math.max(3, goals[0].percentage))}%`,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions List with "SHOW MORE" button from Reference 3 */}
        <View style={{ marginBottom: spacing.xl }}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
              RECENT TRANSACTIONS
            </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
              <AppText variant="labelSmall" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                ALL TRANSACTIONS ↗
              </AppText>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.txBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            {recentTransactions.length > 0 ? (
              <>
                {recentTransactions.map((tx, idx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    showDivider={idx < recentTransactions.length - 1}
                    onPress={() =>
                      navigation.navigate('TransactionDetail', { transactionId: tx.id })
                    }
                  />
                ))}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('TransactionsTab')}
                  style={[
                    styles.showMoreButton,
                    { borderTopColor: colors.borderLight, borderTopWidth: 1 },
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: colors.textSecondary,
                      letterSpacing: 1.8,
                      fontWeight: '700',
                      textAlign: 'center',
                    }}
                  >
                    SHOW MORE ↗
                  </AppText>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyRecentBox}>
                <CategoryIcon name="Receipt" size={24} color={colors.textSecondary} />
                <AppText
                  variant="bodyMedium"
                  style={{ color: colors.textPrimary, fontWeight: '600', marginTop: 8 }}
                >
                  No transactions yet
                </AppText>
                <AppText
                  variant="metadata"
                  style={{ color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}
                >
                  Tap + EXPENSE above to record your first transaction.
                </AppText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Account Switcher Modal */}
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setAccountModalVisible(false)}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.sm,
                padding: spacing.md,
              },
            ]}
          >
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 1.8, marginBottom: spacing.md }}
            >
              SELECT ACCOUNT
            </AppText>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedAccountId('all');
                setAccountModalVisible(false);
              }}
              style={[
                styles.accountOption,
                selectedAccountId === 'all' && {
                  backgroundColor: colors.surfaceLighter,
                  borderColor: colors.accentRed,
                  borderWidth: 1,
                },
              ]}
            >
              <AppText
                variant="cardTitle"
                style={{
                  color: colors.textPrimary,
                  fontWeight: selectedAccountId === 'all' ? '700' : '500',
                  fontSize: 15,
                }}
              >
                ALL ACCOUNTS
              </AppText>
              <AppText
                variant="amountSmall"
                privacySensitive
                style={{
                  color: selectedAccountId === 'all' ? colors.accentRed : colors.textPrimary,
                  fontWeight: '600',
                }}
              >
                {formatCurrency(financialSummary?.availableBalance || 0, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </TouchableOpacity>

            {accounts.map(acc => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedAccountId(acc.id);
                    setAccountModalVisible(false);
                  }}
                  style={[
                    styles.accountOption,
                    isSelected && {
                      backgroundColor: colors.surfaceLighter,
                      borderColor: colors.accentRed,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View>
                    <AppText
                      variant="cardTitle"
                      style={{
                        color: colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: 15,
                      }}
                    >
                      {acc.name}
                    </AppText>
                    <AppText
                      variant="metadata"
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                      }}
                    >
                      {acc.type.toUpperCase()}
                    </AppText>
                  </View>
                  <AppText
                    variant="amountSmall"
                    privacySensitive
                    style={{
                      color: isSelected ? colors.accentRed : colors.textPrimary,
                      fontWeight: '600',
                    }}
                  >
                    {formatCurrency(acc.balance, currencySymbol, isPrivacyMode, false)}
                  </AppText>
                </TouchableOpacity>
              );
            })}

            <AppButton
              title="MANAGE ACCOUNTS"
              onPress={() => {
                setAccountModalVisible(false);
                navigation.navigate('MoreTab', { screen: 'Accounts' });
              }}
              variant="outline"
              size="small"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  quickActionBar: {
    flexDirection: 'row',
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
  },
  accountRailCard: {
    borderWidth: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spendingBox: {
    borderWidth: 1,
  },
  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  spendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  goalPreviewCard: {
    borderWidth: 1,
  },
  goalBarTrack: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
  },
  txBox: {
    borderWidth: 1,
  },
  showMoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecentBox: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
  },
  accountOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
});
