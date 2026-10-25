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
        subtitle="Recurring"
        title="Subscriptions"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.plusBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 18,
                width: 36,
                height: 36,
              },
            ]}
          >
            <CategoryIcon name="Plus" size={17} color={colors.textPrimary} strokeWidth={2.2} />
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
        {/* Subscriptions Overview Summary */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.md + 2,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="sectionHeading" style={{ color: colors.textSecondary }}>
            MONTHLY SUBSCRIPTIONS
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 4 }}
          >
            {formatCurrency(summary.monthlyTotal, currencySymbol, isPrivacyMode, false)}
          </AppText>

          <View style={[styles.yearlyRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingTop: spacing.sm + 2 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
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
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 10 }}>
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
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.borderLight,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
                      {sub.name}
                    </AppText>
                    <View
                      style={[
                        styles.dueBadge,
                        {
                          backgroundColor: dueStatus.isUrgent ? 'rgba(255, 59, 48, 0.12)' : 'rgba(52, 199, 89, 0.12)',
                          borderRadius: radius.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelSmall"
                        style={{
                          color: dueStatus.isUrgent ? colors.accentRed : colors.positive,
                          fontSize: 10,
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

              {/* Action Buttons */}
              <View
                style={[
                  styles.subActionsRow,
                  {
                    borderTopColor: colors.borderLight,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    marginTop: 12,
                    paddingTop: 10,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleLogExpense(sub)}
                  style={[
                    styles.markPaidBtn,
                    {
                      backgroundColor: colors.surfaceLighter,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <CategoryIcon name="Check" size={13} color={colors.accentRed} strokeWidth={2.4} />
                  <AppText variant="labelSmall" style={{ color: colors.textPrimary, marginLeft: 6, fontWeight: '600' }}>
                    Mark Paid
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDelete(sub.id, sub.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ paddingVertical: 4, paddingHorizontal: 8 }}
                >
                  <AppText variant="metadata" style={{ color: colors.accentRed, fontWeight: '600' }}>
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
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.borderLight,
              backgroundColor: colors.surfaceCard,
              borderRadius: radius.lg,
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
          title="Add Subscription"
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
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.borderLight,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderRadius: radius.xl,
                  padding: spacing.lg,
                },
              ]}
            >
              <View style={styles.sheetHandleWrap}>
                <View style={[styles.sheetHandle, { backgroundColor: colors.borderLight }]} />
              </View>

              <AppText variant="cardTitle" style={{ color: colors.textPrimary, marginBottom: spacing.md, fontWeight: '700', fontSize: 18 }}>
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
                    activeOpacity={0.7}
                    onPress={() => {
                      setName(preset.label);
                      if (!amount) setAmount(preset.amt);
                    }}
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                      borderRadius: radius.full,
                      backgroundColor: name === preset.label ? colors.accentRed : colors.surfaceLighter,
                    }}
                  >
                    <AppText
                      variant="labelSmall"
                      style={{
                        color: name === preset.label ? '#FFFFFF' : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      +{preset.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.inputBox, { backgroundColor: colors.surfaceLighter }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
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

              <View style={[styles.inputBox, { backgroundColor: colors.surfaceLighter, marginTop: 10 }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
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

              <View style={[styles.inputBox, { backgroundColor: colors.surfaceLighter, marginTop: 10 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
                    NEXT BILLING DATE
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setNextBillingDate(getTodayDateString())}
                      style={{
                        paddingVertical: 3,
                        paddingHorizontal: 10,
                        borderRadius: radius.full,
                        backgroundColor: nextBillingDate === getTodayDateString() ? colors.accentRed : colors.surfaceCard,
                      }}
                    >
                      <AppText variant="labelSmall" style={{ color: nextBillingDate === getTodayDateString() ? '#FFFFFF' : colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                        Today
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setNextBillingDate(getInitialNextDate())}
                      style={{
                        paddingVertical: 3,
                        paddingHorizontal: 10,
                        borderRadius: radius.full,
                        backgroundColor: nextBillingDate === getInitialNextDate() ? colors.accentRed : colors.surfaceCard,
                      }}
                    >
                      <AppText variant="labelSmall" style={{ color: nextBillingDate === getInitialNextDate() ? '#FFFFFF' : colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
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

              <View style={[styles.frequencyRow, { backgroundColor: colors.surfaceLighter, borderRadius: radius.md, padding: 3 }]}>
                {(['monthly', 'yearly'] as const).map(f => {
                  const isSelected = frequency === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      activeOpacity={0.7}
                      onPress={() => setFrequency(f)}
                      style={[
                        styles.freqChip,
                        {
                          backgroundColor: isSelected ? colors.surfaceCard : 'transparent',
                          borderRadius: 8,
                          flex: 1,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelSmall"
                        style={{
                          color: isSelected ? colors.textPrimary : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                          textAlign: 'center',
                        }}
                      >
                        {f === 'monthly' ? 'Monthly' : 'Yearly'}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.reminderRow}>
                <AppText variant="bodyMedium" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Upcoming renewal reminder
                </AppText>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <AppButton
                title="Save Subscription"
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    gap: 4,
  },
  yearlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subItem: {
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  inputBox: {
    padding: 12,
    borderRadius: 12,
  },
  input: {
    fontSize: 16,
    marginTop: 4,
    paddingVertical: 0,
  },
  frequencyRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  freqChip: {
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  dueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
