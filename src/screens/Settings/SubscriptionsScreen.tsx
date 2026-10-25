import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { Subscription } from '../../types';
import { formatCurrency } from '../../utils/currency';
import {
  advanceNextBillingDate,
  getDueStatus,
  getCurrentTimeString,
  getTodayDateString,
} from '../../utils/date';
import { SubscriptionPromptModal } from '../../components/finance/SubscriptionPromptModal';

interface SubscriptionsScreenProps {
  navigation: any;
}

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const {
    summary,
    loadSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    logSubscriptionExpense,
    isLoading,
  } = useSubscriptionStore();
  const accounts = useAccountStore(state => state.accounts);
  const categories = useCategoryStore(state => state.categories);

  const getInitialNextDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  };

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubForPrompt, setSelectedSubForPrompt] = useState<Subscription | null>(null);
  const [isLoggingExpense, setIsLoggingExpense] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(getInitialNextDate());
  const [reminder, setReminder] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptions();
    }, [loadSubscriptions])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a subscription name.');
      return;
    }
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    await createSubscription({
      name: name.trim(),
      amount: val,
      frequency,
      nextBillingDate,
      categoryId: categories.find(c => c.name === 'Subscriptions')?.id || categories[0]?.id || 'cat-subscriptions',
      accountId: accounts[0]?.id || '',
      reminderEnabled: reminder,
    });

    setModalVisible(false);
    setName('');
    Alert.alert('Subscription Added', `Added ${name} to recurring subscriptions.`);
  };

  const handleDelete = (id: string, subName: string) => {
    Alert.alert('Remove Subscription', `Delete ${subName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSubscription(id) },
    ]);
  };

  const handleLogExpense = (sub: Subscription) => {
    setSelectedSubForPrompt(sub);
  };

  const handleConfirmLogExpense = async () => {
    if (!selectedSubForPrompt) return;
    setIsLoggingExpense(true);
    try {
      const targetSub = selectedSubForPrompt;
      await logSubscriptionExpense(targetSub);
      const subName = targetSub.name;
      const amountStr = formatCurrency(targetSub.amount, currencySymbol, false, false);
      const nextDate = advanceNextBillingDate(targetSub.nextBillingDate, targetSub.frequency);
      setSelectedSubForPrompt(null);
      Alert.alert(
        'Subscription Paid',
        `Logged ${amountStr} for "${subName}" to expenses. Next billing date: ${nextDate}.`
      );
    } catch {
      Alert.alert('Error', 'Failed to log subscription expense.');
    } finally {
      setIsLoggingExpense(false);
    }
  };

  const handleDismissPrompt = () => {
    setSelectedSubForPrompt(null);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        subtitle="RECURRING"
        title="Subscriptions"
        rightAction={
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.plusBtn,
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
        {/* Subscriptions Overview Summary (Requirement 22) */}
        <View
          style={[
            styles.summaryCard,
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
            MONTHLY SUBSCRIPTIONS
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 2 }}
          >
            {formatCurrency(summary.monthlyTotal, currencySymbol, isPrivacyMode, false)}
          </AppText>

          <View style={[styles.yearlyRow, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.sm }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
              YEARLY COMMITMENT
            </AppText>
            <AppText
              variant="amountSmall"
              privacySensitive
              style={{ color: colors.textPrimary, fontWeight: '700' }}
            >
              {formatCurrency(summary.yearlyTotal, currencySymbol, isPrivacyMode, false)} / year
            </AppText>
          </View>
        </View>

        {/* Subscriptions List */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 8 }}>
          ACTIVE SUBSCRIPTIONS ({summary.subscriptions.length})
        </AppText>

        {summary.subscriptions.map(sub => {
          const dueStatus = getDueStatus(sub.nextBillingDate);
          return (
            <View
              key={sub.id}
              style={[
                styles.subItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16 }}>
                      {sub.name}
                    </AppText>
                    <View
                      style={[
                        styles.dueBadge,
                        {
                          backgroundColor: dueStatus.isUrgent ? 'rgba(217, 83, 79, 0.15)' : 'rgba(52, 106, 62, 0.12)',
                          borderColor: dueStatus.isUrgent ? colors.coral : colors.accent,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelSmall"
                        style={{
                          color: dueStatus.isUrgent ? colors.coral : colors.accent,
                          fontSize: 9,
                          fontWeight: '700',
                        }}
                      >
                        {dueStatus.text}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 4 }}>
                    Next due: {sub.nextBillingDate} • {sub.frequency}
                  </AppText>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <AppText
                    variant="amountSmall"
                    privacySensitive
                    style={{ color: colors.textPrimary, fontWeight: '700' }}
                  >
                    {formatCurrency(sub.amount, currencySymbol, isPrivacyMode, false)}
                    <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                      {' '}/{sub.frequency === 'monthly' ? 'mo' : 'yr'}
                    </AppText>
                  </AppText>
                </View>
              </View>

              {/* Action Buttons: 1-Tap Log & Delete */}
              <View
                style={[
                  styles.subActionsRow,
                  {
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    marginTop: 10,
                    paddingTop: 8,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleLogExpense(sub)}
                  style={[
                    styles.markPaidBtn,
                    {
                      backgroundColor: colors.accentRedSurface,
                      borderColor: colors.accentRed,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <CategoryIcon name="Zap" size={12} color={colors.accentRed} strokeWidth={2.4} />
                  <AppText variant="labelSmall" style={{ color: colors.textPrimary, marginLeft: 6, fontWeight: '700' }}>
                    MARK PAID (LOG EXPENSE)
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(sub.id, sub.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ paddingVertical: 4, paddingHorizontal: 8 }}
                >
                  <AppText variant="metadata" style={{ color: colors.coral }}>
                    Remove
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {summary.subscriptions.length === 0 && (
          <View
            style={{
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              borderRadius: radius.xs,
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <AppText variant="metadata" style={{ color: colors.textSecondary }}>
              No recurring subscriptions recorded yet.
            </AppText>
          </View>
        )}

        <AppButton
          title="+ ADD SUBSCRIPTION"
          onPress={() => setModalVisible(true)}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.md, marginBottom: 30 }}
        />
      </ScrollView>

      {/* Add Subscription Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                },
              ]}
            >
              <AppText variant="cardTitle" style={{ color: colors.textPrimary, marginBottom: spacing.md }}>
                Add Subscription
              </AppText>

              {/* Quick Preset Chips */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {[
                  { label: 'Netflix', amt: '649' },
                  { label: 'Spotify', amt: '119' },
                  { label: 'YouTube', amt: '149' },
                  { label: 'iCloud', amt: '75' },
                ].map(preset => (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => {
                      setName(preset.label);
                      if (!amount) setAmount(preset.amt);
                    }}
                    style={{
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      backgroundColor: name === preset.label ? colors.accentRedSurface : colors.surfaceLighter,
                      borderWidth: 1,
                      borderColor: name === preset.label ? colors.accentRed : colors.border,
                    }}
                  >
                    <AppText
                      variant="labelSmall"
                      style={{
                        color: name === preset.label ? colors.coral : colors.textSecondary,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                    >
                      +{preset.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                  SERVICE NAME
                </AppText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Netflix, Spotify, iCloud"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>

              <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 10 }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                  AMOUNT
                </AppText>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 649"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>

              <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 10 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                    NEXT BILLING DATE
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => setNextBillingDate(getTodayDateString())}
                      style={{
                        paddingVertical: 2,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        backgroundColor: nextBillingDate === getTodayDateString() ? colors.accentRedSurface : colors.surfaceLighter,
                        borderWidth: 1,
                        borderColor: nextBillingDate === getTodayDateString() ? colors.accentRed : colors.border,
                      }}
                    >
                      <AppText variant="labelSmall" style={{ color: nextBillingDate === getTodayDateString() ? colors.coral : colors.textSecondary, fontSize: 10 }}>
                        ⚡ Today
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setNextBillingDate(getInitialNextDate())}
                      style={{
                        paddingVertical: 2,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        backgroundColor: nextBillingDate === getInitialNextDate() ? colors.accentRedSurface : colors.surfaceLighter,
                        borderWidth: 1,
                        borderColor: nextBillingDate === getInitialNextDate() ? colors.accentRed : colors.border,
                      }}
                    >
                      <AppText variant="labelSmall" style={{ color: nextBillingDate === getInitialNextDate() ? colors.coral : colors.textSecondary, fontSize: 10 }}>
                        +1 Month
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  value={nextBillingDate}
                  onChangeText={setNextBillingDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>

              <View style={styles.frequencyRow}>
                {(['monthly', 'yearly'] as const).map(f => {
                  const isSelected = frequency === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setFrequency(f)}
                      style={[
                        styles.freqChip,
                        {
                          backgroundColor: isSelected ? colors.accentRed : colors.surface,
                          borderColor: isSelected ? colors.accentRed : colors.border,
                          flex: 1,
                          marginHorizontal: 4,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelSmall"
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                          textAlign: 'center',
                        }}
                      >
                        {f.toUpperCase()}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.reminderRow}>
                <AppText variant="bodyMedium" style={{ color: colors.textPrimary }}>
                  Upcoming renewal reminder
                </AppText>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  trackColor={{ false: colors.border, true: colors.accentRedSurface }}
                  thumbColor={reminder ? colors.accent : '#F4F4F4'}
                />
              </View>

              <AppButton
                title="SAVE SUBSCRIPTION"
                onPress={handleCreate}
                variant="primary"
                size="large"
                style={{ marginTop: spacing.md }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Subscription Expense Prompt Modal */}
      <SubscriptionPromptModal
        visible={!!selectedSubForPrompt}
        subscription={selectedSubForPrompt}
        onConfirm={handleConfirmLogExpense}
        onDismiss={handleDismissPrompt}
        isProcessing={isLoggingExpense}
      />
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
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderWidth: 1,
  },
  yearlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subItem: {
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
  },
  inputBox: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
  },
  input: {
    fontSize: 15,
    marginTop: 4,
    paddingVertical: 0,
  },
  frequencyRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  freqChip: {
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  dueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    marginLeft: 8,
  },
  subActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});
