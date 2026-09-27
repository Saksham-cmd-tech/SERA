import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { Avatar } from '../../components/common/Avatar';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { SeraLogo } from '../../components/common/SeraLogo';
import { useSettingsStore } from '../../store/useSettingsStore';
import { notificationService } from '../../services/notificationService';
import { budgetRepository } from '../../database/repositories/budgetRepository';
import { formatCurrency } from '../../utils/currency';
import { db } from '../../database/database';
import { smsService } from '../../services/smsService';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode, isDark } = useAppTheme();
  const {
    settings,
    loadSettings,
    togglePrivacyMode,
    toggleDarkMode,
    setCurrency,
    setPinCode,
    updateSettings,
    resetToNewUser,
  } = useSettingsStore();

  const [smsDetectionEnabled, setSmsDetectionEnabled] = useState(true);
  const [hasSmsPerm, setHasSmsPerm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      async function checkSms() {
        const perm = await smsService.hasPermission();
        const enabled = await smsService.isDetectionEnabled();
        setHasSmsPerm(perm);
        setSmsDetectionEnabled(enabled);
      }
      checkSms();
    }, [loadSettings])
  );

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState(settings.userName || '');
  const [editBudget, setEditBudget] = useState(settings.monthlyBudgetGoal ? String(settings.monthlyBudgetGoal) : '');
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  ];

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will wipe all transactions, accounts, and budgets, and return to the onboarding screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetToNewUser();
          },
        },
      ]
    );
  };

  const handleSetPin = async () => {
    if (enteredPin.length === 4) {
      await setPinCode(enteredPin);
      setPinModalVisible(false);
      setEnteredPin('');
      Alert.alert('Security', 'PIN protection has been enabled.');
    } else {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
    }
  };

  const handleSaveProfile = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    const parsedBudget = parseFloat(editBudget) || 0;
    await updateSettings({
      userName: trimmed,
      monthlyBudgetGoal: parsedBudget,
    });
    if (parsedBudget > 0) {
      await budgetRepository.setTotalBudget(parsedBudget);
    }
    setProfileModalVisible(false);
    Alert.alert('Profile Saved', 'Your profile details have been updated.');
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header
          subtitle="SERA • PREFERENCES"
          title="Settings"
          rightAction={<SeraLogo size={28} />}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setEditName(settings.userName || '');
            setEditBudget(settings.monthlyBudgetGoal ? String(settings.monthlyBudgetGoal) : '');
            setProfileModalVisible(true);
          }}
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar size={48} name={settings.userName || 'User'} uri={settings.userAvatarUri} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 18 }}>
                  {settings.userName || 'User'}
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  EDIT ✎
                </AppText>
              </View>
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
                Primary Currency: {settings.currency} ({currencySymbol})
                {settings.monthlyBudgetGoal > 0 ? ` • Budget: ${formatCurrency(settings.monthlyBudgetGoal, currencySymbol, isPrivacyMode, false)}` : ''}
              </AppText>
            </View>
          </View>
        </TouchableOpacity>

        {/* SECTION: FINANCE & STATEMENTS */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 6 }}>
          FINANCE & MODULES
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              marginBottom: spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Reports')}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CategoryIcon name="FileText" size={16} color={colors.textPrimary} />
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 10 }}>
                Monthly Financial Reports
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Subscriptions')}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CategoryIcon name="Repeat" size={16} color={colors.textPrimary} />
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 10 }}>
                Subscription Tracker
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Accounts')}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CategoryIcon name="Wallet" size={16} color={colors.textPrimary} />
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 10 }}>
                Manage Accounts & Net Worth
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Analytics')}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CategoryIcon name="SlidersHorizontal" size={16} color={colors.textPrimary} />
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 10 }}>
                Financial Analytics & Insights
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* SECTION: PREFERENCES */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 6 }}>
          PREFERENCES
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              marginBottom: spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setCurrencyModalVisible(true)}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                Currency
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                {settings.currency} ({currencySymbol})
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                Dark Theme
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                Editorial dark green mode
              </AppText>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={isDark ? colors.accent : '#F4F4F4'}
            />
          </View>

          <View style={styles.rowItem}>
            <View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                Privacy Mode
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                Mask balances globally ({currencySymbol}••••••)
              </AppText>
            </View>
            <Switch
              value={isPrivacyMode}
              onValueChange={togglePrivacyMode}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={isPrivacyMode ? colors.accent : '#F4F4F4'}
            />
          </View>
        </View>

        {/* SECTION: SYSTEM NOTIFICATIONS */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 6 }}>
          SYSTEM NOTIFICATIONS
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              marginBottom: spacing.md,
            },
          ]}
        >
          {/* Master Notifications Toggle */}
          <View style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                Push Notifications
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                Native Android channels & background alerts
              </AppText>
            </View>
            <Switch
              value={settings.notificationsEnabled ?? true}
              onValueChange={async (val) => {
                if (val) {
                  const granted = await notificationService.requestPermission();
                  await updateSettings({ notificationsEnabled: granted });
                } else {
                  await notificationService.cancelAll();
                  await notificationService.cancelDailyReminder();
                  await updateSettings({ notificationsEnabled: false, dailyReminderEnabled: false });
                }
              }}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={(settings.notificationsEnabled ?? true) ? colors.accent : '#F4F4F4'}
            />
          </View>

          {/* Daily 8:00 PM Reminder */}
          <View style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                Daily Expense Reminder
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                Scheduled alarm at 8:00 PM every day
              </AppText>
            </View>
            <Switch
              value={settings.dailyReminderEnabled ?? true}
              disabled={!(settings.notificationsEnabled ?? true)}
              onValueChange={async (val) => {
                if (val) {
                  await notificationService.scheduleDailyReminder(20, 0);
                  await updateSettings({ dailyReminderEnabled: true });
                } else {
                  await notificationService.cancelDailyReminder();
                  await updateSettings({ dailyReminderEnabled: false });
                }
              }}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={(settings.dailyReminderEnabled ?? true) ? colors.accent : '#F4F4F4'}
            />
          </View>

          {/* Budget Overrun Alerts */}
          <View style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                Budget Overrun Warnings
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                Instant alert when category limit is exceeded
              </AppText>
            </View>
            <Switch
              value={settings.budgetAlertsEnabled ?? true}
              disabled={!(settings.notificationsEnabled ?? true)}
              onValueChange={async (val) => {
                await updateSettings({ budgetAlertsEnabled: val });
              }}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={(settings.budgetAlertsEnabled ?? true) ? colors.accent : '#F4F4F4'}
            />
          </View>

          {/* Send Test Notification Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              const success = await notificationService.sendTestNotification();
              if (success) {
                Alert.alert('Notification Sent', 'Check your Android status bar for the SERA system notification!');
              }
            }}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CategoryIcon name="Bell" size={16} color={colors.positive} />
              <AppText variant="bodyLarge" style={{ color: colors.positive, fontWeight: '600', marginLeft: 10 }}>
                Send Test System Notification
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Test All 3 Transaction Alerts */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              await notificationService.sendTransactionAlert('expense', 420, 'Blue Tokai Coffee', 'Primary Bank');
              setTimeout(() => {
                notificationService.sendTransactionAlert('income', 4500, 'Ramesh Sharma', 'Primary Bank');
              }, 600);
              setTimeout(() => {
                notificationService.sendTransactionAlert('transfer', 2000, 'Savings Account', 'Primary Bank', 'Savings Account');
              }, 1200);
            }}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <CategoryIcon name="Zap" size={16} color={colors.accent} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Test All 3 Transaction Notifications
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Pushes Sent (₹420), Received (₹4,500), and Transfer (₹2,000)
                </AppText>
              </View>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* SECTION: SMS AUTO-DETECTION */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 6 }}>
          SMS TRANSACTION AUTO-DETECTION
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              marginBottom: spacing.md,
            },
          ]}
        >
          {/* SMS Detection Toggle */}
          <View style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                  Bank SMS Detection
                </AppText>
                <View
                  style={{
                    backgroundColor: hasSmsPerm ? 'rgba(52, 106, 62, 0.15)' : 'rgba(217, 83, 79, 0.15)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 2,
                    marginLeft: 8,
                  }}
                >
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: hasSmsPerm ? colors.accent : colors.coral,
                      fontSize: 9,
                      fontWeight: '700',
                    }}
                  >
                    {hasSmsPerm ? 'ACTIVE' : 'PERMISSION NEEDED'}
                  </AppText>
                </View>
              </View>
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
                Auto-detect bank debit alerts & push prompt to record expense
              </AppText>
            </View>
            <Switch
              value={smsDetectionEnabled && hasSmsPerm}
              onValueChange={async (val) => {
                if (val) {
                  const perm = await smsService.requestPermission();
                  setHasSmsPerm(perm);
                  if (perm) {
                    await smsService.setDetectionEnabled(true);
                    setSmsDetectionEnabled(true);
                  } else {
                    Alert.alert(
                      'SMS Permission Required',
                      'Please allow SMS permission so SERA can detect bank transactions locally.'
                    );
                  }
                } else {
                  await smsService.setDetectionEnabled(false);
                  setSmsDetectionEnabled(false);
                }
              }}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={smsDetectionEnabled && hasSmsPerm ? colors.accent : '#F4F4F4'}
            />
          </View>

          {/* Test SMS Detection: Sent / Expense */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              await smsService.simulateExpenseSms(420, 'Blue Tokai Coffee');
            }}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <CategoryIcon name="ArrowUpRight" size={16} color={colors.coral} strokeWidth={2.4} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Test Money Sent SMS (Expense)
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Simulates debit alert: "Debited ₹420 to Blue Tokai Coffee"
                </AppText>
              </View>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Test SMS Detection: Received / Income */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              await smsService.simulateIncomeSms(4500, 'Ramesh Sharma');
            }}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <CategoryIcon name="ArrowDownLeft" size={16} color={colors.positive} strokeWidth={2.4} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Test Money Received SMS (Income)
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Simulates credit alert: "Credited ₹4,500 by Ramesh Sharma"
                </AppText>
              </View>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Test SMS Detection: Transferred / Transfer */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              await smsService.simulateTransferSms(2000, 'Savings a/c **5678');
            }}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <CategoryIcon name="Repeat" size={16} color={colors.accent} strokeWidth={2.4} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Test Transfer SMS (Transfer)
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Simulates transfer alert: "Transferred ₹2,000 to Savings via IMPS"
                </AppText>
              </View>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* SECTION: SECURITY */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 6 }}>
          SECURITY & PRIVACY
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                PIN Protection
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                {settings.pinLockEnabled ? 'Enabled' : 'Disabled'}
              </AppText>
            </View>
            <Switch
              value={settings.pinLockEnabled}
              onValueChange={val => {
                if (val) {
                  setPinModalVisible(true);
                } else {
                  setPinCode(undefined);
                }
              }}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={settings.pinLockEnabled ? colors.accent : '#F4F4F4'}
            />
          </View>

          <View style={styles.rowItem}>
            <View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
                Biometric Unlock
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                FaceID / Fingerprint authorization
              </AppText>
            </View>
            <Switch
              value={settings.biometricEnabled}
              onValueChange={val => updateSettings({ biometricEnabled: val })}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={settings.biometricEnabled ? colors.accent : '#F4F4F4'}
            />
          </View>
        </View>

        {/* SECTION: DATA MANAGEMENT */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 6 }}>
          DATA MANAGEMENT
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Reports')}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
              Export CSV Data
            </AppText>
            <CategoryIcon name="Download" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              const json = await db.exportAllData();
              Alert.alert('Backup JSON Created', `Backup file created (${json.length} bytes).`);
            }}
            style={[styles.rowItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
          >
            <AppText variant="bodyLarge" style={{ color: colors.textPrimary }}>
              Export Full JSON Backup
            </AppText>
            <CategoryIcon name="Download" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResetData} style={styles.rowItem}>
            <AppText variant="bodyLarge" style={{ color: colors.coral, fontWeight: '600' }}>
              Reset & Return to Onboarding
            </AppText>
            <CategoryIcon name="RotateCcw" size={16} color={colors.coral} />
          </TouchableOpacity>
        </View>

        {/* BRAND FOOTER: SERA */}
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.lg,
            marginBottom: spacing.xxl,
          }}
        >
          <SeraLogo size={52} showText showTagline direction="column" />
          <AppText
            variant="metadata"
            style={{
              color: colors.textMuted,
              marginTop: 10,
              fontSize: 11,
              letterSpacing: 0.5,
              textAlign: 'center',
            }}
          >
            SERA v1.0.0 (Build 1)
          </AppText>
          <AppText
            variant="metadata"
            style={{
              color: colors.textMuted,
              fontSize: 10,
              marginTop: 2,
              textAlign: 'center',
            }}
          >
            100% Offline • Private SQLite Encrypted on Device
          </AppText>
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCurrencyModalVisible(false)}
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
              Select Currency
            </AppText>

            {currencies.map(c => {
              const isSelected = settings.currency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => {
                    setCurrency(c.code, c.symbol);
                    setCurrencyModalVisible(false);
                  }}
                  style={[
                    styles.currencyOption,
                    {
                      backgroundColor: isSelected ? colors.cardDark : colors.background,
                      borderColor: colors.border,
                      borderRadius: radius.xs,
                      marginBottom: 8,
                    },
                  ]}
                >
                  <AppText
                    variant="cardTitle"
                    style={{
                      color: isSelected ? colors.textInverted : colors.textPrimary,
                      fontSize: 16,
                    }}
                  >
                    {c.symbol} {c.code}
                  </AppText>
                  <AppText
                    variant="metadata"
                    style={{
                      color: isSelected ? colors.textInverted : colors.textSecondary,
                    }}
                  >
                    {c.name}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* PIN Setup Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPinModalVisible(false)}
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
              Set 4-Digit Security PIN
            </AppText>

            <TextInput
              value={enteredPin}
              onChangeText={setEnteredPin}
              placeholder="••••"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              autoFocus
            />

            <AppButton
              title="CONFIRM PIN"
              onPress={handleSetPin}
              variant="primary"
              size="large"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setProfileModalVisible(false)}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <TouchableOpacity
            activeOpacity={1}
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
              Edit Profile & Budget
            </AppText>

            <AppText variant="labelSmall" style={{ color: colors.textSecondary, marginBottom: 4 }}>
              YOUR NAME
            </AppText>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.inputField,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

            <AppText variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 14, marginBottom: 4 }}>
              MONTHLY BUDGET GOAL ({currencySymbol})
            </AppText>
            <TextInput
              value={editBudget}
              onChangeText={setEditBudget}
              placeholder="e.g. 35000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[
                styles.inputField,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

            <AppButton
              title="SAVE CHANGES"
              onPress={handleSaveProfile}
              variant="primary"
              size="large"
              style={{ marginTop: spacing.lg }}
            />
          </TouchableOpacity>
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
  profileCard: {
    borderWidth: 1,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    borderWidth: 1,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
  },
  pinInput: {
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});
