import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Dimensions,
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
import { promptReceiptOptions } from '../../utils/receiptPicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  const { transactions, deleteTransaction, duplicateTransaction, updateTransaction } =
    useTransactionStore();
  const categories = useCategoryStore(state => state.categories);
  const accounts = useAccountStore(state => state.accounts);

  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const handleAttachOrChangeReceipt = () => {
    promptReceiptOptions(async uri => {
      await updateTransaction(tx.id, { receiptUri: uri });
    });
  };

  const handleRemoveReceipt = () => {
    Alert.alert(
      'Remove Receipt',
      'Remove the attached receipt image from this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await updateTransaction(tx.id, { receiptUri: undefined });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        subtitle="Details"
        title="Transaction"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 59, 48, 0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CategoryIcon name="Trash2" size={17} color={colors.accentRed} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Amount Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: category?.color ? category.color + '22' : colors.surfaceLighter,
                  borderRadius: radius.md,
                },
              ]}
            >
              <CategoryIcon
                name={category?.icon || 'DollarSign'}
                size={22}
                color={category?.color || colors.textPrimary}
              />
            </View>
            <View
              style={[
                styles.badgeWrap,
                {
                  backgroundColor:
                    tx.type === 'expense'
                      ? 'rgba(255, 59, 48, 0.12)'
                      : tx.type === 'income'
                      ? 'rgba(52, 199, 89, 0.12)'
                      : colors.surfaceLighter,
                  borderRadius: radius.full,
                },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{
                  color:
                    tx.type === 'expense'
                      ? colors.accentRed
                      : tx.type === 'income'
                      ? colors.positive
                      : colors.textSecondary,
                  fontWeight: '700',
                  fontSize: 11,
                }}
              >
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
              </AppText>
            </View>
          </View>

          <AppText
            variant="displayLarge"
            style={[
              styles.amountText,
              {
                color:
                  tx.type === 'expense'
                    ? colors.textPrimary
                    : tx.type === 'income'
                    ? colors.positive
                    : colors.textPrimary,
              },
            ]}
          >
            {formatSignedAmount(tx.amount, tx.type, currencySymbol, isPrivacyMode)}
          </AppText>

          <AppText
            variant="cardTitle"
            style={{ color: colors.textPrimary, fontSize: 20, marginTop: 4, fontWeight: '600' }}
          >
            {tx.merchant}
          </AppText>
        </View>

        {/* Detailed Breakdown Card */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Account
            </AppText>
            <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {account?.name || 'Account'}
            </AppText>
          </View>

          {tx.toAccountId && (
            <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
                Transferred To
              </AppText>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {toAccount?.name || 'Destination Account'}
              </AppText>
            </View>
          )}

          <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Category
            </AppText>
            <AppText variant="bodyMedium" style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {category?.name || 'Uncategorized'}
            </AppText>
          </View>

          <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
              Date & Time
            </AppText>
            <AppText variant="bodyMedium" style={{ color: colors.textPrimary }}>
              {tx.date} • {tx.time}
            </AppText>
          </View>

          {tx.description ? (
            <View style={[styles.detailRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <AppText variant="bodyMedium" style={{ color: colors.textSecondary, fontWeight: '500' }}>
                Note
              </AppText>
              <AppText variant="bodyMedium" style={{ color: colors.textPrimary, flex: 1, textAlign: 'right' }}>
                {tx.description}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Receipt Card Section */}
        <View
          style={[
            styles.receiptCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.receiptTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CategoryIcon name="Camera" size={16} color={colors.textPrimary} />
              <AppText
                variant="bodyMedium"
                style={{ color: colors.textPrimary, fontWeight: '600', marginLeft: 8 }}
              >
                Receipt Attachment
              </AppText>
            </View>
            {tx.receiptUri ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAttachOrChangeReceipt}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText variant="labelSmall" style={{ color: colors.accentRed, fontWeight: '700' }}>
                  Change
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>

          {tx.receiptUri ? (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setLightboxOpen(true)}
                style={[
                  styles.imagePreviewWrap,
                  { borderColor: colors.borderLight, borderRadius: radius.md },
                ]}
              >
                <Image
                  source={{ uri: tx.receiptUri }}
                  style={styles.attachedImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlayBadge}>
                  <CategoryIcon name="Maximize2" size={14} color="#FFFFFF" />
                  <AppText variant="labelSmall" style={{ color: '#FFFFFF', marginLeft: 4 }}>
                    Tap to expand
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRemoveReceipt}
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
              >
                <AppText variant="labelSmall" style={{ color: colors.accentRed, fontWeight: '600' }}>
                  Remove Receipt
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noReceiptBox}>
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginBottom: 12 }}>
                No receipt attached to this transaction.
              </AppText>
              <AppButton
                title="Attach Receipt"
                onPress={handleAttachOrChangeReceipt}
                variant="surface"
                size="small"
                icon={<CategoryIcon name="Camera" size={14} color={colors.textPrimary} />}
              />
            </View>
          )}
        </View>

        {/* Action Buttons: Duplicate & Delete */}
        <View style={styles.actionsRow}>
          <AppButton
            title="Duplicate"
            onPress={handleDuplicate}
            variant="surface"
            size="medium"
            icon={<CategoryIcon name="Copy" size={14} color={colors.textPrimary} />}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AppButton
            title="Delete"
            onPress={handleDelete}
            variant="coral"
            size="medium"
            icon={<CategoryIcon name="Trash2" size={14} color="#FFFFFF" />}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>

      {/* Full-screen Lightbox Modal for Receipt Image */}
      {tx.receiptUri ? (
        <Modal
          visible={lightboxOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setLightboxOpen(false)}
        >
          <View style={styles.lightboxContainer}>
            <SafeAreaView style={styles.lightboxHeader}>
              <TouchableOpacity
                onPress={() => setLightboxOpen(false)}
                style={styles.lightboxCloseBtn}
              >
                <CategoryIcon name="X" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <AppText variant="label" style={{ color: '#FFFFFF', letterSpacing: 1.5 }}>
                RECEIPT PREVIEW
              </AppText>
              <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={styles.lightboxImageWrap}>
              <Image
                source={{ uri: tx.receiptUri }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerWrap: {
    paddingVertical: 4,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {},
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  amountText: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  detailCard: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  receiptCard: {},
  receiptTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imagePreviewWrap: {
    width: '100%',
    height: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  attachedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  noReceiptBox: {
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  lightboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  lightboxCloseBtn: {
    padding: 8,
  },
  lightboxImageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  lightboxImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.75,
  },
});
