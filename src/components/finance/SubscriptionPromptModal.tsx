import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { Subscription } from '../../types';
import { useAccountStore } from '../../store/useAccountStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { formatCurrency } from '../../utils/currency';
import { getDueStatus, advanceNextBillingDate } from '../../utils/date';

export interface SubscriptionPromptModalProps {
  visible: boolean;
  subscription: Subscription | null;
  onConfirm: () => Promise<void> | void;
  onDismiss: () => void;
  isProcessing?: boolean;
}

export const SubscriptionPromptModal: React.FC<SubscriptionPromptModalProps> = ({
  visible,
  subscription,
  onConfirm,
  onDismiss,
  isProcessing = false,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const accounts = useAccountStore(state => state.accounts);
  const categories = useCategoryStore(state => state.categories);

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!subscription) {
    return null;
  }

  const account = accounts.find(a => a.id === subscription.accountId) || accounts[0];
  const category = categories.find(c => c.id === subscription.categoryId);
  const dueStatus = getDueStatus(subscription.nextBillingDate);
  const nextDate = advanceNextBillingDate(subscription.nextBillingDate, subscription.frequency);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Header Badge & Close Button */}
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: dueStatus.isUrgent
                        ? 'rgba(235, 59, 46, 0.15)'
                        : 'rgba(52, 106, 62, 0.18)',
                      borderColor: dueStatus.isUrgent ? colors.accentRed : colors.accent,
                    },
                  ]}
                >
                  <CategoryIcon
                    name={dueStatus.isUrgent ? 'Zap' : 'Repeat'}
                    size={11}
                    color={dueStatus.isUrgent ? colors.coral : colors.accent}
                    strokeWidth={2.4}
                  />
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: dueStatus.isUrgent ? colors.coral : colors.accent,
                      marginLeft: 5,
                      fontWeight: '700',
                      letterSpacing: 1.2,
                      fontSize: 10,
                    }}
                  >
                    {dueStatus.text}
                  </AppText>
                </View>

                <TouchableOpacity
                  onPress={onDismiss}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={[
                    styles.closeBtn,
                    {
                      backgroundColor: colors.surfaceLighter,
                      borderColor: colors.border,
                    },
                  ]}
                  accessibilityLabel="Close subscription prompt"
                  accessibilityRole="button"
                >
                  <CategoryIcon name="X" size={14} color={colors.textSecondary} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* Icon & Title */}
              <View style={styles.titleSection}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: 'rgba(235, 59, 46, 0.12)',
                      borderColor: 'rgba(235, 59, 46, 0.3)',
                    },
                  ]}
                >
                  <CategoryIcon
                    name="Repeat"
                    size={26}
                    color={colors.accentRed}
                    strokeWidth={2.2}
                  />
                </View>

                <AppText
                  variant="pageHeading"
                  style={[styles.mainTitle, { color: colors.textPrimary }]}
                >
                  Add to Expenses?
                </AppText>

                <AppText
                  variant="metadata"
                  style={[styles.mainDescription, { color: colors.textSecondary }]}
                >
                  A recurring subscription payment is due. Would you like to record it in your expenses and advance to the next cycle?
                </AppText>
              </View>

              {/* Subscription Details Box */}
              <View
                style={[
                  styles.detailsBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              >
                {/* Name & Amount Row */}
                <View style={styles.subTopRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <AppText
                      variant="cardTitle"
                      numberOfLines={1}
                      style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '700' }}
                    >
                      {subscription.name}
                    </AppText>
                    <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
                      {subscription.frequency === 'monthly' ? 'Monthly Subscription' : 'Yearly Subscription'}
                    </AppText>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText
                      variant="amountLarge"
                      privacySensitive
                      style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 20 }}
                    >
                      {formatCurrency(subscription.amount, currencySymbol, isPrivacyMode, false)}
                    </AppText>
                    <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                      /{subscription.frequency === 'monthly' ? 'mo' : 'yr'}
                    </AppText>
                  </View>
                </View>

                {/* Divider */}
                <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

                {/* Metadata Items */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <CategoryIcon name="Wallet" size={12} color={colors.textSecondary} strokeWidth={2} />
                    <AppText
                      variant="metadata"
                      numberOfLines={1}
                      style={{ color: colors.textSecondary, marginLeft: 6, fontSize: 11 }}
                    >
                      {account ? account.name : 'Primary Account'}
                    </AppText>
                  </View>

                  <View style={styles.metaItem}>
                    <CategoryIcon name="Calendar" size={12} color={colors.textSecondary} strokeWidth={2} />
                    <AppText
                      variant="metadata"
                      style={{ color: colors.textSecondary, marginLeft: 6, fontSize: 11 }}
                    >
                      Next: {nextDate}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={isProcessing}
                  activeOpacity={0.82}
                  style={[
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.accentRed,
                      borderRadius: radius.md,
                    },
                  ]}
                  accessibilityRole="button"
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CategoryIcon name="Check" size={16} color="#FFFFFF" strokeWidth={2.6} />
                      <AppText
                        variant="label"
                        style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: 8, fontSize: 14 }}
                      >
                        Add to Expense
                      </AppText>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onDismiss}
                  disabled={isProcessing}
                  activeOpacity={0.7}
                  style={[
                    styles.secondaryBtn,
                    {
                      borderColor: colors.border,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceLighter,
                    },
                  ]}
                  accessibilityRole="button"
                >
                  <AppText
                    variant="label"
                    style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 13 }}
                  >
                    Not Now
                  </AppText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  mainDescription: {
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 13,
    paddingHorizontal: 8,
  },
  detailsBox: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  subTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  innerDivider: {
    height: 1,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionsContainer: {
    gap: 10,
  },
  primaryBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
