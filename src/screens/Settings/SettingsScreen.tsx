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
  KeyboardAvoidingView,
  Platform,
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
import { biometricService } from '../../services/biometricService';

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

  useFocusEffect(
    useCallback(() => {
      loadSettings();
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
      <Header
        subtitle="Preferences"
        title="Settings"
        showSeraMonogram
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Apple ID Style Profile Row */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setEditName(settings.userName || '');
            setEditBudget(settings.monthlyBudgetGoal ? String(settings.monthlyBudgetGoal) : '');
            setProfileModalVisible(true);
          }}
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar size={52} name={settings.userName || 'User'} uri={settings.userAvatarUri} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
                {settings.userName || 'User'}
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
                Currency: {settings.currency} ({currencySymbol})
                {settings.monthlyBudgetGoal > 0 ? ` • Budget: ${formatCurrency(settings.monthlyBudgetGoal, currencySymbol, isPrivacyMode, false)}` : ''}
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* SECTION: FINANCE & MODULES */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 8 }}>
          FINANCE MODULES
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              marginBottom: spacing.lg,
              overflow: 'hidden',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Reports')}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#007AFF' }]}>
                <CategoryIcon name="FileText" size={16} color="#FFFFFF" />
              </View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 12, fontWeight: '500' }}>
                Financial Reports
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Subscriptions')}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#AF52DE' }]}>
                <CategoryIcon name="Repeat" size={16} color="#FFFFFF" />
              </View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 12, fontWeight: '500' }}>
                Subscriptions & Bills
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Accounts')}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#34C759' }]}>
                <CategoryIcon name="Wallet" size={16} color="#FFFFFF" />
              </View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 12, fontWeight: '500' }}>
                Accounts & Net Worth
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Analytics')}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#FF9500' }]}>
                <CategoryIcon name="SlidersHorizontal" size={16} color="#FFFFFF" />
              </View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 12, fontWeight: '500' }}>
                Analytics & Insights
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* SECTION: PREFERENCES */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 8 }}>
          PREFERENCES
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              marginBottom: spacing.lg,
              overflow: 'hidden',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCurrencyModalVisible(true)}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#5856D6' }]}>
                <CategoryIcon name="DollarSign" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Currency
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  {settings.currency} ({currencySymbol})
                </AppText>
              </View>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <View style={styles.rowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#1C1C1E' }]}>
                <CategoryIcon name="Moon" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Dark Mode
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  OLED deep black
                </AppText>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <View style={styles.rowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#64D2FF' }]}>
                <CategoryIcon name="EyeOff" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Privacy Mode
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Mask balance numbers ({currencySymbol}••••)
                </AppText>
              </View>
            </View>
            <Switch
              value={isPrivacyMode}
              onValueChange={togglePrivacyMode}
              trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SECTION: SYSTEM NOTIFICATIONS */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 8 }}>
          NOTIFICATIONS
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              marginBottom: spacing.lg,
              overflow: 'hidden',
            },
          ]}
        >
          {/* Master Notifications Toggle */}
          <View style={styles.rowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#FF2D55' }]}>
                <CategoryIcon name="Bell" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Notifications
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  System channels & daily alerts
                </AppText>
              </View>
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
              trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          {/* Daily 8:00 PM Reminder */}
          <View style={styles.rowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#FF9500' }]}>
                <CategoryIcon name="Clock" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Daily Evening Reminder
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Scheduled at 8:00 PM
                </AppText>
              </View>
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
              trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          {/* Budget Overrun Alerts */}
          <View style={styles.rowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#FF3B30' }]}>
                <CategoryIcon name="AlertTriangle" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Overrun Alerts
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Alert when category exceeds limit
                </AppText>
              </View>
            </View>
            <Switch
              value={settings.budgetAlertsEnabled ?? true}
              disabled={!(settings.notificationsEnabled ?? true)}
              onValueChange={async (val) => {
                await updateSettings({ budgetAlertsEnabled: val });
              }}
              trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SECTION: SECURITY */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 8 }}>
          SECURITY & PRIVACY
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              marginBottom: spacing.lg,
              overflow: 'hidden',
            },
          ]}
        >
          <View style={styles.rowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#5856D6' }]}>
                <CategoryIcon name="Lock" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  PIN Code
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  {settings.pinLockEnabled ? 'Enabled' : 'Disabled'}
                </AppText>
              </View>
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
              trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <View style={styles.rowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#34C759' }]}>
                <CategoryIcon name="Shield" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  Biometrics
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                  Face / Fingerprint authorization
                </AppText>
              </View>
            </View>
            <Switch
              value={settings.biometricEnabled}
              onValueChange={async val => {
                if (val) {
                  const check = await biometricService.checkBiometrics();
                  if (!check.available || !check.enrolled) {
                    Alert.alert(
                      'Biometrics Unavailable',
                      check.error || 'No enrolled fingerprint or face unlock detected. Please set up biometrics in your Android Settings first.'
                    );
                    return;
                  }
                  const auth = await biometricService.authenticate(
                    'SERA Security',
                    'Enable Biometric Unlock',
                    'Verify your fingerprint or face to enable biometric protection',
                    'Cancel'
                  );
                  if (auth.success) {
                    await updateSettings({ biometricEnabled: true });
                  } else if (auth.error && auth.error !== 'AUTH_ERROR') {
                    Alert.alert('Verification Failed', auth.message || 'Could not verify biometrics.');
                  }
                } else {
                  await updateSettings({ biometricEnabled: false });
                }
              }}
              trackColor={{ false: colors.surfaceLighter, true: colors.positive }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SECTION: DATA MANAGEMENT */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 8 }}>
          DATA MANAGEMENT
        </AppText>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              marginBottom: spacing.xl,
              overflow: 'hidden',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Reports')}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#007AFF' }]}>
                <CategoryIcon name="Download" size={16} color="#FFFFFF" />
              </View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 12, fontWeight: '500' }}>
                Export CSV Data
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              const json = await db.exportAllData();
              Alert.alert('Backup JSON Created', `Backup file created (${json.length} bytes).`);
            }}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: '#30B0C7' }]}>
                <CategoryIcon name="FileText" size={16} color="#FFFFFF" />
              </View>
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 12, fontWeight: '500' }}>
                Export Full JSON Backup
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { borderBottomColor: colors.borderLight }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleResetData}
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBadge, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                <CategoryIcon name="RotateCcw" size={16} color={colors.accentRed} />
              </View>
              <AppText variant="bodyLarge" style={{ color: colors.accentRed, marginLeft: 12, fontWeight: '600' }}>
                Reset & Return to Onboarding
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.accentRed} />
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
          <SeraLogo size={34} showText showTagline direction="column" />
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
            SERA v1.0.1 (Build 2)
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
              Select Currency
            </AppText>

            {currencies.map(c => {
              const isSelected = settings.currency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  activeOpacity={0.7}
                  onPress={() => {
                    setCurrency(c.code, c.symbol);
                    setCurrencyModalVisible(false);
                  }}
                  style={[
                    styles.currencyOption,
                    {
                      backgroundColor: isSelected ? colors.surfaceLighter : 'transparent',
                      borderRadius: radius.md,
                      marginBottom: 6,
                    },
                  ]}
                >
                  <View>
                    <AppText
                      variant="cardTitle"
                      style={{
                        color: colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: 16,
                      }}
                    >
                      {c.symbol} {c.code}
                    </AppText>
                    <AppText
                      variant="metadata"
                      style={{
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {c.name}
                    </AppText>
                  </View>
                  {isSelected && (
                    <CategoryIcon name="Check" size={18} color={colors.accentRed} strokeWidth={2.5} />
                  )}
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setPinModalVisible(false)}
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
                    backgroundColor: colors.surfaceLighter,
                    color: colors.textPrimary,
                    borderRadius: radius.md,
                  },
                ]}
                autoFocus
              />

              <AppButton
                title="Confirm PIN"
                onPress={handleSetPin}
                variant="primary"
                size="large"
                style={{ marginTop: spacing.md }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setProfileModalVisible(false)}
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
                Edit Profile & Budget
              </AppText>

              <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 6 }}>
                YOUR NAME
              </AppText>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.inputField,
                  {
                    backgroundColor: colors.surfaceLighter,
                    color: colors.textPrimary,
                    borderRadius: radius.md,
                  },
                ]}
              />

              <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginTop: 14, marginBottom: 6 }}>
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
                    backgroundColor: colors.surfaceLighter,
                    color: colors.textPrimary,
                    borderRadius: radius.md,
                  },
                ]}
              />

              <AppButton
                title="Save Changes"
                onPress={handleSaveProfile}
                variant="primary"
                size="large"
                style={{ marginTop: spacing.lg }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  profileCard: {},
  sectionCard: {},
  settingIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowDivider: {
    marginLeft: 58,
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
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pinInput: {
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 12,
    paddingVertical: 12,
  },
  inputField: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
