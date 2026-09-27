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
import { useSettingsStore } from '../../store/useSettingsStore';
import { budgetRepository } from '../../database/repositories/budgetRepository';
import { formatCurrency } from '../../utils/currency';
import { db } from '../../database/database';

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
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header subtitle="PREFERENCES" title="Settings" />
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
