import React, { useState, useMemo } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { TransactionRow } from '../../components/finance/TransactionRow';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import { Transaction } from '../../types';
import { formatDateLabel, formatMonthYear } from '../../utils/date';

interface TransactionsScreenProps {
  navigation: any;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius } = useAppTheme();

  const {
    filteredTransactions,
    filters,
    setFilters,
    resetFilters,
    loadTransactions,
    isLoading,
  } = useTransactionStore();

  const categories = useCategoryStore(state => state.categories);
  const accounts = useAccountStore(state => state.accounts);

  const [searchVisible, setSearchVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // Group transactions by date
  const groupedSections = useMemo(() => {
    const map = new Map<string, Transaction[]>();

    for (const tx of filteredTransactions) {
      const key = tx.date;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(tx);
    }

    const sections: { title: string; date: string; data: Transaction[] }[] = [];
    map.forEach((txList, dateKey) => {
      sections.push({
        title: formatDateLabel(dateKey),
        date: dateKey,
        data: txList,
      });
    });

    return sections;
  }, [filteredTransactions]);

  const activeFilterCount =
    (filters.type && filters.type !== 'all' ? 1 : 0) +
    (filters.categoryIds && filters.categoryIds.length > 0 ? 1 : 0) +
    (filters.accountIds && filters.accountIds.length > 0 ? 1 : 0);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerContainer, { paddingHorizontal: spacing.screenPadding }]}>
        <Header
          subtitle={formatMonthYear()}
          title="Transactions"
          rightAction={
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setSearchVisible(!searchVisible)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[
                  styles.actionButton,
                  searchVisible && { backgroundColor: colors.cardDark },
                ]}
              >
                <CategoryIcon
                  name="Search"
                  size={18}
                  color={searchVisible ? colors.textInverted : colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterModalVisible(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[
                  styles.actionButton,
                  { marginLeft: 8 },
                  activeFilterCount > 0 && { backgroundColor: colors.accent },
                ]}
              >
                <CategoryIcon
                  name="SlidersHorizontal"
                  size={18}
                  color={activeFilterCount > 0 ? colors.accentText : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          }
        />

        {/* Global Search Bar */}
        {searchVisible && (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xs,
                marginTop: spacing.xs,
              },
            ]}
          >
            <CategoryIcon name="Search" size={16} color={colors.textSecondary} />
            <TextInput
              value={filters.searchQuery}
              onChangeText={text => setFilters({ searchQuery: text })}
              placeholder="Search merchant, notes, amount..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              autoFocus
            />
            {filters.searchQuery ? (
              <TouchableOpacity onPress={() => setFilters({ searchQuery: '' })}>
                <CategoryIcon name="Trash2" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Type Quick Selector Pills */}
        <View style={[styles.typePillsRow, { marginTop: spacing.sm, marginBottom: spacing.xs }]}>
          {(['all', 'expense', 'income', 'transfer'] as const).map(typeKey => {
            const isSelected = (filters.type || 'all') === typeKey;
            return (
              <TouchableOpacity
                key={typeKey}
                onPress={() => setFilters({ type: typeKey })}
                style={[
                  styles.typePill,
                  {
                    backgroundColor: isSelected ? colors.cardDark : colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.xs,
                    marginRight: 6,
                  },
                ]}
              >
                <AppText
                  variant="labelSmall"
                  style={{
                    color: isSelected ? colors.textInverted : colors.textSecondary,
                    letterSpacing: 1.2,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {typeKey.toUpperCase()}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Grouped Transaction List */}
      <SectionList
        sections={groupedSections}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
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
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <AppText
              variant="label"
              style={{
                color: colors.textSecondary,
                letterSpacing: 1.8,
                paddingVertical: 8,
              }}
            >
              {title}
            </AppText>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View
            style={[
              styles.itemContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderTopWidth: index === 0 ? 1 : 0,
                borderBottomWidth: index === section.data.length - 1 ? 1 : 0,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <TransactionRow
              transaction={item}
              showDivider={index < section.data.length - 1}
              onPress={() =>
                navigation.navigate('TransactionDetail', { transactionId: item.id })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="NO TRANSACTIONS FOUND"
            subtitle={
              filters.searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search terms or filter presets.'
                : 'Start tracking your financial life with your first entry.'
            }
            actionTitle={
              filters.searchQuery || activeFilterCount > 0 ? 'RESET FILTERS' : '+ ADD TRANSACTION'
            }
            onAction={() => {
              if (filters.searchQuery || activeFilterCount > 0) {
                resetFilters();
              } else {
                navigation.navigate('AddTransaction');
              }
            }}
          />
        }
      />

      {/* Filter Modal Sheet */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.filterSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
              },
            ]}
          >
            <View style={styles.sheetTopRow}>
              <AppText variant="cardTitle" style={{ color: colors.textPrimary }}>
                Filter Transactions
              </AppText>
              <TouchableOpacity onPress={() => resetFilters()}>
                <AppText variant="labelSmall" style={{ color: colors.coral, fontWeight: '700' }}>
                  RESET ALL
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Filter by Type */}
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 1.4, marginTop: spacing.md }}
            >
              TRANSACTION TYPE
            </AppText>
            <View style={styles.typeOptionsRow}>
              {(['all', 'expense', 'income', 'transfer'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setFilters({ type: t })}
                  style={[
                    styles.sheetPill,
                    {
                      backgroundColor:
                        (filters.type || 'all') === t ? colors.cardDark : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    style={{
                      color:
                        (filters.type || 'all') === t ? colors.textInverted : colors.textPrimary,
                    }}
                  >
                    {t.toUpperCase()}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter by Category */}
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 1.4, marginTop: spacing.md }}
            >
              CATEGORY
            </AppText>
            <View style={styles.categoriesWrap}>
              {categories.slice(0, 8).map(c => {
                const isSelected = filters.categoryIds?.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      const current = filters.categoryIds || [];
                      const updated = isSelected
                        ? current.filter(id => id !== c.id)
                        : [...current, c.id];
                      setFilters({ categoryIds: updated });
                    }}
                    style={[
                      styles.sheetPill,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.background,
                        borderColor: colors.border,
                        marginRight: 6,
                        marginBottom: 6,
                      },
                    ]}
                  >
                    <AppText
                      variant="labelSmall"
                      style={{
                        color: isSelected ? colors.accentText : colors.textPrimary,
                      }}
                    >
                      {c.name.toUpperCase()}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Filter by Account */}
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 1.4, marginTop: spacing.md }}
            >
              ACCOUNT
            </AppText>
            <View style={styles.categoriesWrap}>
              {accounts.map(a => {
                const isSelected = filters.accountIds?.includes(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => {
                      const current = filters.accountIds || [];
                      const updated = isSelected
                        ? current.filter(id => id !== a.id)
                        : [...current, a.id];
                      setFilters({ accountIds: updated });
                    }}
                    style={[
                      styles.sheetPill,
                      {
                        backgroundColor: isSelected ? colors.cardDark : colors.background,
                        borderColor: colors.border,
                        marginRight: 6,
                        marginBottom: 6,
                      },
                    ]}
                  >
                    <AppText
                      variant="labelSmall"
                      style={{
                        color: isSelected ? colors.textInverted : colors.textPrimary,
                      }}
                    >
                      {a.name.toUpperCase()}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton
              title="APPLY FILTERS"
              onPress={() => setFilterModalVisible(false)}
              variant="primary"
              size="large"
              style={{ marginTop: spacing.lg }}
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
  headerContainer: {
    paddingBottom: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
  typePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingTop: 12,
  },
  itemContainer: {
    overflow: 'hidden',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    maxHeight: '80%',
  },
  sheetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeOptionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  sheetPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
});
