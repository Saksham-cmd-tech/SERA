import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useSettingsStore } from '../../store/useSettingsStore';
import { db } from '../../database/database';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode, isDark } = useAppTheme();
  const {
    settings,
    togglePrivacyMode,
    toggleDarkMode,
    setCurrency,
    setPinCode,
    updateSettings,
  } = useSettingsStore();

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
      'This will reset all balances, transactions, and budgets back to default demo state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Demo',
          style: 'destructive',
          onPress: async () => {
            await db.seedInitialData();
            Alert.alert('Reset Complete', 'Demo financial data restored.');
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

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header showBack onPressBack={() => navigation.goBack()} subtitle="PREFERENCES" title="Settings" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View
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
            <View
              style={[
                styles.avatarLarge,
                { backgroundColor: colors.cardDark, borderColor: colors.border },
              ]}
            >
              <AppText variant="cardTitle" style={{ color: colors.textInverted }}>
                AW
              </AppText>
            </View>
            <View style={{ marginLeft: 12 }}>
              <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 18 }}>
                {settings.userName || 'Alexander Wright'}
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                Primary Currency: {settings.currency} ({currencySymbol})
              </AppText>
            </View>
          </View>
        </View>

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
            style={styles.rowItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CategoryIcon name="Wallet" size={16} color={colors.textPrimary} />
              <AppText variant="bodyLarge" style={{ color: colors.textPrimary, marginLeft: 10 }}>
                Manage Accounts & Net Worth
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
              Restore Demo Data
            </AppText>
            <CategoryIcon name="Trash2" size={16} color={colors.coral} />
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
});
