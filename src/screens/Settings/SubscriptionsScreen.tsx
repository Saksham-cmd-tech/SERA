import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { formatCurrency } from '../../utils/currency';

interface SubscriptionsScreenProps {
  navigation: any;
}

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { summary, loadSubscriptions, createSubscription, deleteSubscription, isLoading } =
    useSubscriptionStore();
  const accounts = useAccountStore(state => state.accounts);
  const categories = useCategoryStore(state => state.categories);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('649');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('2026-10-18');
  const [reminder, setReminder] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

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
      accountId: accounts[0]?.id || 'acc-hdfc',
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

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header
          showBack
          onPressBack={() => navigation.goBack()}
          subtitle="RECURRING"
          title="Subscriptions"
          rightAction={
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.plusBtn, { backgroundColor: colors.cardDark }]}
            >
              <CategoryIcon name="Plus" size={16} color={colors.textInverted} strokeWidth={2.2} />
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

        {summary.subscriptions.map(sub => (
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16 }}>
                  {sub.name}
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
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
                <TouchableOpacity
                  onPress={() => handleDelete(sub.id, sub.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ marginTop: 4 }}
                >
                  <AppText variant="metadata" style={{ color: colors.coral }}>
                    Remove
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

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
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View
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
                placeholder="649"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.input, { color: colors.textPrimary }]}
              />
            </View>

            <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 10 }]}>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                NEXT BILLING DATE
              </AppText>
              <TextInput
                value={nextBillingDate}
                onChangeText={setNextBillingDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.textPrimary }]}
              />
            </View>

            <View style={styles.frequencyRow}>
              {(['monthly', 'yearly'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={[
                    styles.freqChip,
                    {
                      backgroundColor: frequency === f ? colors.cardDark : colors.background,
                      borderColor: colors.border,
                      flex: 1,
                      marginHorizontal: 4,
                    },
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: frequency === f ? colors.textInverted : colors.textPrimary,
                      textAlign: 'center',
                    }}
                  >
                    {f.toUpperCase()}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.reminderRow}>
              <AppText variant="bodyMedium" style={{ color: colors.textPrimary }}>
                Upcoming renewal reminder
              </AppText>
              <Switch
                value={reminder}
                onValueChange={setReminder}
                trackColor={{ false: colors.border, true: colors.cardDark }}
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
  headerWrap: {
    paddingBottom: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
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
});
