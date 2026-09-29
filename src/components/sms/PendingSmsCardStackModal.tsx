import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { AppButton } from '../common/AppButton';
import { usePendingSmsStore } from '../../store/usePendingSmsStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { PendingSmsItem } from '../../services/smsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PendingSmsCardStackModal: React.FC = () => {
  const { colors, radius, spacing, currencySymbol, isDark } = useAppTheme();
  const {
    items,
    isModalVisible,
    currentIndex,
    closeModal,
    addTransactionFromSms,
    snoozeForLater,
    dismissItem,
  } = usePendingSmsStore();

  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active items to review
  const activeCards = items.slice(currentIndex);
  const currentCard: PendingSmsItem | undefined = activeCards[0];
  const totalCount = items.length;
  const currentCardNumber = currentIndex + 1;

  if (!isModalVisible || !currentCard) {
    return null;
  }

  // Determine current account
  const currentAccount =
    accounts.find(a => a.id === (selectedAccountId || currentCard.accountId)) ||
    accounts[0];

  // Determine current category
  const currentCategory =
    categories.find(c => c.id === (selectedCategoryId || currentCard.categoryId)) ||
    categories.find(c => c.type === (currentCard.type === 'income' ? 'income' : 'expense')) ||
    categories[0];

  const handleAdd = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await addTransactionFromSms(
        currentCard,
        currentAccount?.id,
        currentCategory?.id
      );
      setSelectedAccountId(null);
      setSelectedCategoryId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLater = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await snoozeForLater(currentCard.id);
      setSelectedAccountId(null);
      setSelectedCategoryId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await dismissItem(currentCard.id);
      setSelectedAccountId(null);
      setSelectedCategoryId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const cycleAccount = () => {
    if (accounts.length <= 1) return;
    const currentIdx = accounts.findIndex(a => a.id === currentAccount?.id);
    const nextIdx = (currentIdx + 1) % accounts.length;
    setSelectedAccountId(accounts[nextIdx].id);
  };

  const cycleCategory = () => {
    const relevantCategories = categories.filter(
      c => c.type === (currentCard.type === 'income' ? 'income' : 'expense') || c.type === 'both'
    );
    if (relevantCategories.length <= 1) return;
    const currentIdx = relevantCategories.findIndex(c => c.id === currentCategory?.id);
    const nextIdx = (currentIdx + 1) % relevantCategories.length;
    setSelectedCategoryId(relevantCategories[nextIdx].id);
  };

  // Card background and badge accents
  const isIncome = currentCard.type === 'income';
  const isTransfer = currentCard.type === 'transfer';

  const typeLabel = isIncome
    ? 'MONEY RECEIVED'
    : isTransfer
    ? 'SELF TRANSFER'
    : 'MONEY SENT';

  const typeIcon = isIncome ? 'ArrowDownLeft' : isTransfer ? 'Repeat' : 'ArrowUpRight';
  const typeColor = isIncome ? colors.positive : isTransfer ? colors.accent : colors.coral;
  const typeBg = isIncome
    ? 'rgba(46, 125, 50, 0.12)'
    : isTransfer
    ? 'rgba(74, 90, 75, 0.15)'
    : 'rgba(217, 83, 79, 0.12)';

  return (
    <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeModal}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeModal}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.container}>
          {/* Header Row: Label & Close Button */}
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <View style={[styles.pulseDot, { backgroundColor: colors.positive }]} />
              <AppText variant="label" style={{ color: colors.textPrimary, letterSpacing: 2 }}>
                PENDING SMS INBOX
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <AppText
                  variant="labelSmall"
                  style={{ color: colors.textSecondary, fontWeight: '700' }}
                >
                  {currentCardNumber} OF {totalCount}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <CategoryIcon name="X" size={16} color={colors.textPrimary} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tactile Card Stack Container */}
          <View style={styles.stackWrapper}>
            {/* Background Peek Card 2 (Bottom) */}
            {activeCards.length > 2 && (
              <View
                pointerEvents="none"
                style={[
                  styles.peekCard,
                  styles.peekCardBottom,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              />
            )}

            {/* Background Peek Card 1 (Middle) */}
            {activeCards.length > 1 && (
              <View
                pointerEvents="none"
                style={[
                  styles.peekCard,
                  styles.peekCardMiddle,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              />
            )}

            {/* Active Front Card */}
            <View
              style={[
                styles.frontCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  shadowColor: isDark ? '#000000' : '#172018',
                },
              ]}
            >
              {/* Type Badge & Timestamp */}
              <View style={styles.cardTopRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
                  <CategoryIcon name={typeIcon} size={13} color={typeColor} strokeWidth={2.5} />
                  <AppText
                    variant="labelSmall"
                    style={{ color: typeColor, fontWeight: '800', marginLeft: 4, letterSpacing: 1 }}
                  >
                    {typeLabel}
                  </AppText>
                </View>

                {currentCard.status === 'later' && (
                  <View
                    style={[
                      styles.laterStatusBadge,
                      { backgroundColor: colors.surfaceLighter, borderColor: colors.border },
                    ]}
                  >
                    <CategoryIcon name="Clock" size={11} color={colors.textSecondary} />
                    <AppText
                      variant="metadata"
                      style={{ color: colors.textSecondary, marginLeft: 3, fontWeight: '600' }}
                    >
                      SAVED FOR LATER
                    </AppText>
                  </View>
                )}
              </View>

              {/* Amount Display */}
              <View style={styles.amountSection}>
                <AppText
                  variant="displayMedium"
                  style={[styles.amountText, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {currencySymbol}
                  {currentCard.amountStr || currentCard.amount.toFixed(2)}
                </AppText>
                <AppText
                  variant="cardTitle"
                  style={{ color: colors.textPrimary, marginTop: 4, fontWeight: '700' }}
                  numberOfLines={1}
                >
                  {isIncome ? `From: ${currentCard.merchant}` : `To: ${currentCard.merchant}`}
                </AppText>
              </View>

              {/* Raw Bank SMS Snippet */}
              {!!currentCard.rawText && (
                <View
                  style={[
                    styles.rawTextContainer,
                    { backgroundColor: colors.background, borderColor: colors.borderLight },
                  ]}
                >
                  <CategoryIcon name="FileText" size={13} color={colors.textMuted} strokeWidth={2} />
                  <AppText
                    variant="metadata"
                    numberOfLines={2}
                    style={{ color: colors.textSecondary, marginLeft: 6, flex: 1, fontSize: 11 }}
                  >
                    "{currentCard.rawText}"
                  </AppText>
                </View>
              )}

              {/* Quick Config Chips: Account & Category */}
              <View style={styles.selectorsRow}>
                {/* Account Chip */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={cycleAccount}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surfaceLighter, borderColor: colors.border },
                  ]}
                >
                  <CategoryIcon name="Wallet" size={13} color={colors.textPrimary} strokeWidth={2} />
                  <AppText
                    variant="metadata"
                    style={{ color: colors.textPrimary, marginLeft: 5, fontWeight: '600', maxWidth: 90 }}
                    numberOfLines={1}
                  >
                    {currentAccount?.name || 'Account'}
                  </AppText>
                  {accounts.length > 1 && (
                    <CategoryIcon name="ChevronRight" size={11} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {/* Category Chip */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={cycleCategory}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surfaceLighter, borderColor: colors.border },
                  ]}
                >
                  <CategoryIcon
                    name={currentCategory?.icon || 'Tag'}
                    size={13}
                    color={currentCategory?.color || colors.textPrimary}
                    strokeWidth={2}
                  />
                  <AppText
                    variant="metadata"
                    style={{ color: colors.textPrimary, marginLeft: 5, fontWeight: '600', maxWidth: 100 }}
                    numberOfLines={1}
                  >
                    {currentCategory?.name || 'Category'}
                  </AppText>
                  <CategoryIcon name="ChevronRight" size={11} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* 3 Explicit Tactile Actions */}
              <View style={styles.actionsContainer}>
                {/* 1. Primary Action: Add to SERA */}
                <AppButton
                  title={
                    isIncome
                      ? 'ADD INCOME TO SERA'
                      : isTransfer
                      ? 'ADD TRANSFER TO SERA'
                      : 'ADD EXPENSE TO SERA'
                  }
                  onPress={handleAdd}
                  variant="primary"
                  size="large"
                  disabled={isProcessing}
                  style={styles.primaryAddBtn}
                />

                {/* Row for Secondary Actions: For Later & Dismiss */}
                <View style={styles.secondaryActionRow}>
                  {/* 2. For Later (Snooze) */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleLater}
                    disabled={isProcessing}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: colors.surfaceLighter,
                        borderColor: colors.border,
                        marginRight: 8,
                      },
                    ]}
                  >
                    <CategoryIcon name="Clock" size={14} color={colors.accent} strokeWidth={2.2} />
                    <AppText
                      variant="labelSmall"
                      style={{ color: colors.textPrimary, fontWeight: '700', marginLeft: 6 }}
                    >
                      FOR LATER
                    </AppText>
                  </TouchableOpacity>

                  {/* 3. Dismiss */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleDismiss}
                    disabled={isProcessing}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: colors.surfaceLighter,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <CategoryIcon name="X" size={14} color={colors.coral} strokeWidth={2.2} />
                    <AppText
                      variant="labelSmall"
                      style={{ color: colors.coral, fontWeight: '700', marginLeft: 6 }}
                    >
                      DISMISS
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackWrapper: {
    width: '100%',
    position: 'relative',
    paddingBottom: 20,
  },
  peekCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    borderWidth: 1,
  },
  peekCardBottom: {
    transform: [{ scale: 0.9 }, { translateY: 20 }],
    opacity: 0.45,
  },
  peekCardMiddle: {
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 0.75,
  },
  frontCard: {
    width: '100%',
    borderWidth: 1.5,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  laterStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 4,
  },
  amountSection: {
    marginBottom: 14,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  rawTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 14,
  },
  selectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  actionsContainer: {
    width: '100%',
  },
  primaryAddBtn: {
    marginBottom: 10,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
});
