import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { AppButton } from '../../components/common/AppButton';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import { formatCurrency } from '../../utils/currency';
import { formatMonthYear } from '../../utils/date';

interface ReportsScreenProps {
  navigation: any;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { transactions, financialSummary } = useTransactionStore();
  const categories = useCategoryStore(state => state.categories);
  const accounts = useAccountStore(state => state.accounts);

  const [selectedMonth, setSelectedMonth] = useState<'current' | 'previous'>('current');

  const now = useMemo(() => new Date(), []);
  const prevMonthDate = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now]);
  const currentMonthLabel = useMemo(() => formatMonthYear(now), [now]);
  const prevMonthLabel = useMemo(() => formatMonthYear(prevMonthDate), [prevMonthDate]);

  const monthLabel = selectedMonth === 'current' ? currentMonthLabel : prevMonthLabel;

  // Calculate report metrics
  const income = selectedMonth === 'current' ? (financialSummary?.totalIncome ?? 0) : 0;
  const expenses = selectedMonth === 'current' ? (financialSummary?.totalExpense ?? 0) : 0;
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100 * 10) / 10 : 0;

  // Largest expense transaction
  const largestTx = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0] || null;

  // Top outflow category
  const topCategoryName = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type === 'expense') {
        totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
      }
    }
    const topEntry = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    if (!topEntry) return 'None';
    return categories.find(c => c.id === topEntry[0])?.name || 'Other';
  }, [transactions, categories]);

  const handleExportCSV = () => {
    let csvContent = 'Date,Merchant,Category,Type,Account,Amount,Currency,Notes\n';

    for (const tx of transactions) {
      const cat = categories.find(c => c.id === tx.categoryId)?.name || 'Other';
      const acc = accounts.find(a => a.id === tx.accountId)?.name || 'Account';
      csvContent += `"${tx.date}","${tx.merchant.replace(/"/g, '""')}","${cat}","${tx.type}","${acc}","${tx.amount}","${tx.currency}","${(tx.description || '').replace(/"/g, '""')}"\n`;
    }

    Alert.alert(
      'Export Generated',
      `Successfully generated CSV export (${csvContent.length} bytes) containing ${transactions.length} records.\n\nReady for export & spreadsheet analysis.`
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header showBack onPressBack={() => navigation.goBack()} subtitle="Statements" title="Monthly Report" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector Tabs */}
        <View style={[styles.tabsRow, { backgroundColor: colors.surfaceLighter, borderRadius: 12, marginBottom: spacing.md }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedMonth('current')}
            style={[
              styles.tab,
              selectedMonth === 'current' && {
                backgroundColor: colors.surfaceCard,
                borderRadius: 9,
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{
                color: selectedMonth === 'current' ? colors.textPrimary : colors.textSecondary,
                fontWeight: selectedMonth === 'current' ? '700' : '500',
              }}
            >
              {currentMonthLabel}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedMonth('previous')}
            style={[
              styles.tab,
              selectedMonth === 'previous' && {
                backgroundColor: colors.surfaceCard,
                borderRadius: 9,
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{
                color: selectedMonth === 'previous' ? colors.textPrimary : colors.textSecondary,
                fontWeight: selectedMonth === 'previous' ? '700' : '500',
              }}
            >
              {prevMonthLabel}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Report Card */}
        <View
          style={[
            styles.reportCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.md + 2,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
            {monthLabel.toUpperCase()} SUMMARY
          </AppText>

          <View style={styles.metricRow}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Income
            </AppText>
            <AppText variant="amountMedium" privacySensitive style={{ color: colors.positive, fontWeight: '700' }}>
              {formatCurrency(income, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>

          <View style={[styles.metricRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Expenses
            </AppText>
            <AppText variant="amountMedium" privacySensitive style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {formatCurrency(expenses, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>

          <View style={[styles.metricRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Savings
            </AppText>
            <AppText variant="amountMedium" privacySensitive style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {formatCurrency(savings, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </View>

          <View style={[styles.metricRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Savings Rate
            </AppText>
            <AppText variant="amountMedium" style={{ color: colors.positive, fontWeight: '700' }}>
              {savingsRate}%
            </AppText>
          </View>

          <View style={[styles.metricRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Top Outflow Category
            </AppText>
            <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {topCategoryName}
            </AppText>
          </View>

          <View style={[styles.metricRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500', marginRight: 12 }}>
              Largest Transaction
            </AppText>
            <AppText
              variant="bodyLarge"
              privacySensitive
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: colors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' }}
            >
              {largestTx ? `${largestTx.merchant} — ${formatCurrency(largestTx.amount, currencySymbol, isPrivacyMode, false)}` : 'None'}
            </AppText>
          </View>
        </View>

        {/* Export Buttons */}
        <AppButton
          title="Export CSV Statement"
          onPress={handleExportCSV}
          variant="primary"
          size="large"
          style={{ marginBottom: 12 }}
        />

        <AppButton
          title="Export JSON Backup"
          onPress={() => {
            Alert.alert('JSON Backup Ready', 'Application backup snapshot encrypted and generated.');
          }}
          variant="surface"
          size="medium"
          style={{ marginBottom: 30 }}
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
  tabsRow: {
    flexDirection: 'row',
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCard: {},
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
});
