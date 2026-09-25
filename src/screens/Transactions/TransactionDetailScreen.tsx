import React from 'react';
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
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import { formatSignedAmount } from '../../utils/currency';

interface TransactionDetailScreenProps {
  navigation: any;
  route: {
    params: {
      transactionId: string;
    };
  };
}

export const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { transactionId } = route.params;

  const { transactions, deleteTransaction, duplicateTransaction } = useTransactionStore();
  const categories = useCategoryStore(state => state.categories);
  const accounts = useAccountStore(state => state.accounts);

  const tx = transactions.find(t => t.id === transactionId);

  if (!tx) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header showBack onPressBack={() => navigation.goBack()} title="Transaction" />
        <View style={styles.centerContainer}>
          <AppText variant="bodyLarge" style={{ color: colors.textSecondary }}>
            Transaction not found.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const category = categories.find(c => c.id === tx.categoryId);
  const account = accounts.find(a => a.id === tx.accountId);
  const toAccount = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to permanently delete this transaction? Account balance will be restored.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(tx.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDuplicate = async () => {
    await duplicateTransaction(tx.id);
    Alert.alert('Duplicated', 'Transaction successfully duplicated.');
    navigation.goBack();
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header
          showBack
          onPressBack={() => navigation.goBack()}
          subtitle="DETAILS"
          title="Transaction"
          rightAction={
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <CategoryIcon name="Trash2" size={18} color={colors.coral} />
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
      >
        {/* Dominant Amount Display */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.lg,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.cardDark, borderRadius: radius.xs },
            ]}
          >
            <CategoryIcon
              name={category?.icon || 'Tag'}
              size={14}
              color={colors.textInverted}
            />
            <AppText
              variant="labelSmall"
              style={{ color: colors.textInverted, letterSpacing: 1.4, marginLeft: 6 }}
            >
              {(category?.name || tx.type).toUpperCase()}
            </AppText>
          </View>

          <AppText
            variant="displayLarge"
            privacySensitive
            style={{
              color: tx.type === 'income' ? colors.positive : colors.textPrimary,
              fontWeight: '700',
              marginTop: 12,
            }}
          >
            {formatSignedAmount(tx.amount, tx.type, currencySymbol, isPrivacyMode)}
          </AppText>

          <AppText
            variant="cardTitle"
            style={{ color: colors.textPrimary, fontSize: 20, marginTop: 4 }}
          >
            {tx.merchant}
          </AppText>
        </View>

        {/* Detailed Breakdown Card */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
              ACCOUNT
            </AppText>
            <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {account?.name || 'Account'}
            </AppText>
          </View>

          {tx.toAccountId && (
            <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                TRANSFERRED TO
              </AppText>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {toAccount?.name || 'Destination Account'}
              </AppText>
            </View>
          )}

          <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
              DATE & TIME
            </AppText>
            <AppText variant="bodyMedium" style={{ color: colors.textPrimary }}>
              {tx.date} • {tx.time}
            </AppText>
          </View>

          <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
              TYPE
            </AppText>
            <AppText variant="bodyMedium" style={{ color: colors.textPrimary, textTransform: 'capitalize' }}>
              {tx.type}
            </AppText>
          </View>

          {tx.description && (
            <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                NOTES
              </AppText>
              <AppText variant="bodyMedium" style={{ color: colors.textPrimary, flex: 1, textAlign: 'right' }}>
                {tx.description}
              </AppText>
            </View>
          )}

          {tx.receiptUri && (
            <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                RECEIPT
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CategoryIcon name="Camera" size={14} color={colors.positive} />
                <AppText variant="metadata" style={{ color: colors.positive, marginLeft: 4 }}>
                  Verified Attached
                </AppText>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons: Duplicate & Delete */}
        <View style={styles.actionsRow}>
          <AppButton
            title="DUPLICATE"
            onPress={handleDuplicate}
            variant="surface"
            size="medium"
            icon={<CategoryIcon name="Copy" size={14} color={colors.textPrimary} />}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AppButton
            title="DELETE"
            onPress={handleDelete}
            variant="coral"
            size="medium"
            icon={<CategoryIcon name="Trash2" size={14} color="#FFFFFF" />}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailCard: {
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
