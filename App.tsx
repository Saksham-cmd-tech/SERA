import React, { useEffect, useState, useCallback } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
  AppState,
  Linking,
} from 'react-native';
import {
  NavigationContainer,
  LinkingOptions,
  getStateFromPath,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { db } from './src/database/database';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useAccountStore } from './src/store/useAccountStore';
import { useTransactionStore } from './src/store/useTransactionStore';
import { useBudgetStore } from './src/store/useBudgetStore';
import { useGoalStore } from './src/store/useGoalStore';
import { useCategoryStore } from './src/store/useCategoryStore';
import { useSubscriptionStore } from './src/store/useSubscriptionStore';
import { useAppTheme } from './src/hooks/useAppTheme';
import { AppText } from './src/components/common/AppText';
import { AppButton } from './src/components/common/AppButton';
import { FinanceGrid } from './src/components/common/FinanceGrid';
import { CategoryIcon } from './src/components/common/CategoryIcon';
import { notificationService } from './src/services/notificationService';
import { smsService, DetectedSmsTransaction } from './src/services/smsService';
import { biometricService } from './src/services/biometricService';
import { widgetService } from './src/services/widgetService';

export default function App(): React.JSX.Element {
  const [dbReady, setDbReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');

  const { loadSettings, settings } = useSettingsStore();
  const { loadAccounts } = useAccountStore();
  const { loadTransactions } = useTransactionStore();
  const { loadBudgetSummary } = useBudgetStore();
  const { loadGoals } = useGoalStore();
  const { loadCategories } = useCategoryStore();
  const { loadSubscriptions } = useSubscriptionStore();

  useEffect(() => {
    async function setup() {
      console.log('--- APP SETUP: INITIALIZING DB ---');
      await db.initDatabase();
      console.log('--- APP SETUP: INITIALIZING NOTIFICATIONS ---');
      await notificationService.init();
      console.log('--- APP SETUP: LOADING STORES ---');
      await Promise.all([
        loadSettings(),
        loadAccounts(),
        loadTransactions(),
        loadBudgetSummary(),
        loadGoals(),
        loadCategories(),
        loadSubscriptions(),
      ]);
      console.log('--- APP SETUP: COMPLETE ---');
      setDbReady(true);

      // Sync data to Android Home Screen Widgets
      widgetService.syncWidgets({
        currencySymbol: useSettingsStore.getState().settings.currencySymbol,
        accounts: useAccountStore.getState().accounts,
        transactions: useTransactionStore.getState().transactions,
        budgetSummary: useBudgetStore.getState().summary,
        goals: useGoalStore.getState().goals,
      });
    }
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSecurityActive = (settings.pinLockEnabled && !!settings.pinCode) || !!settings.biometricEnabled;

  useEffect(() => {
    if (isSecurityActive) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [isSecurityActive]);

  const triggerBiometricUnlock = useCallback(async () => {
    if (!settings.biometricEnabled) return;
    const res = await biometricService.authenticate(
      'SERA Security',
      'Unlock SERA',
      'Touch the fingerprint sensor or glance at the screen to unlock',
      settings.pinLockEnabled ? 'Use PIN' : 'Cancel'
    );
    if (res.success) {
      setIsLocked(false);
      setEnteredPin('');
    }
  }, [settings.biometricEnabled, settings.pinLockEnabled]);

  useEffect(() => {
    if (isLocked && settings.biometricEnabled && dbReady) {
      const timer = setTimeout(() => {
        triggerBiometricUnlock();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLocked, settings.biometricEnabled, dbReady, triggerBiometricUnlock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && isSecurityActive) {
        setIsLocked(true);
      }
    });
    return () => sub.remove();
  }, [isSecurityActive]);

  const handleUnlock = () => {
    if (enteredPin === settings.pinCode) {
      setIsLocked(false);
      setEnteredPin('');
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.');
      setEnteredPin('');
    }
  };

  if (!dbReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#B8BBA8' }]}>
        <StatusBar barStyle="dark-content" />
        <FinanceGrid
          barsCount={24}
          height={60}
          minHeight={15}
          color="rgba(23, 32, 24, 0.2)"
          activeColor="#172018"
          progress={0.5}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppContent
        isLocked={isLocked}
        enteredPin={enteredPin}
        setEnteredPin={setEnteredPin}
        onUnlock={handleUnlock}
        onBiometricUnlock={triggerBiometricUnlock}
        biometricEnabled={!!settings.biometricEnabled}
        pinLockEnabled={!!settings.pinLockEnabled && !!settings.pinCode}
      />
    </SafeAreaProvider>
  );
}

export const navigationRef = createNavigationContainerRef<any>();

const linking: LinkingOptions<any> = {
  prefixes: ['sera://'],
  getStateFromPath: (path, options) => {
    const [pathOnly, queryString] = path.replace(/^\/+/, '').split('?');
    const cleanPath = pathOnly;
    const queryParams: Record<string, string> = {};
    if (queryString) {
      queryString.split('&').forEach(part => {
        const [k, v] = part.split('=');
        if (k) {
          try {
            queryParams[decodeURIComponent(k)] = decodeURIComponent(v || '');
          } catch (e) {
            queryParams[k] = v || '';
          }
        }
      });
    }

    if (cleanPath === 'add-expense' || cleanPath === 'add-income' || cleanPath === 'add-transfer') {
      const detectedType =
        cleanPath === 'add-transfer' || queryParams.type === 'transfer'
          ? 'transfer'
          : cleanPath === 'add-income' || queryParams.type === 'income'
          ? 'income'
          : 'expense';
      const initialAmount = queryParams.amount ? parseFloat(queryParams.amount) : undefined;
      const initialMerchant = queryParams.merchant || undefined;
      const initialCategoryId = queryParams.category || undefined;
      const initialNote = queryParams.note || undefined;
      const autoPromptConfirm = queryParams.autoPrompt === 'true';

      return {
        routes: [
          {
            name: 'Main',
            state: {
              index: 1,
              routes: [
                { name: 'HomeTab' },
                {
                  name: 'TransactionsTab',
                  state: {
                    index: 1,
                    routes: [
                      { name: 'TransactionsMain' },
                      {
                        name: 'AddTransaction',
                        params: {
                          initialType: detectedType,
                          initialAmount,
                          initialMerchant,
                          initialCategoryId,
                          initialNote,
                          autoPromptConfirm,
                        },
                      },
                    ],
                  },
                },
                { name: 'BudgetsTab' },
                { name: 'GoalsTab' },
                { name: 'MoreTab' },
              ],
            },
          },
        ],
      };
    }
    if (cleanPath === 'subscriptions') {
      return {
        routes: [
          {
            name: 'Main',
            state: {
              index: 4,
              routes: [
                { name: 'HomeTab' },
                { name: 'TransactionsTab' },
                { name: 'BudgetsTab' },
                { name: 'GoalsTab' },
                {
                  name: 'MoreTab',
                  state: {
                    index: 1,
                    routes: [
                      { name: 'Settings' },
                      { name: 'Subscriptions' },
                    ],
                  },
                },
              ],
            },
          },
        ],
      };
    }
    if (cleanPath === 'budgets') {
      return {
        routes: [
          {
            name: 'Main',
            state: {
              index: 2,
              routes: [
                { name: 'HomeTab' },
                { name: 'TransactionsTab' },
                { name: 'BudgetsTab' },
                { name: 'GoalsTab' },
                { name: 'MoreTab' },
              ],
            },
          },
        ],
      };
    }
    if (cleanPath === 'goals') {
      return {
        routes: [
          {
            name: 'Main',
            state: {
              index: 3,
              routes: [
                { name: 'HomeTab' },
                { name: 'TransactionsTab' },
                { name: 'BudgetsTab' },
                { name: 'GoalsTab' },
                { name: 'MoreTab' },
              ],
            },
          },
        ],
      };
    }
    if (cleanPath === 'accounts') {
      return {
        routes: [
          {
            name: 'Main',
            state: {
              index: 4,
              routes: [
                { name: 'HomeTab' },
                { name: 'TransactionsTab' },
                { name: 'BudgetsTab' },
                { name: 'GoalsTab' },
                {
                  name: 'MoreTab',
                  state: {
                    index: 1,
                    routes: [
                      { name: 'Settings' },
                      { name: 'ManageAccounts' },
                    ],
                  },
                },
              ],
            },
          },
        ],
      };
    }
    return getStateFromPath(path, options);
  },
};

function AppContent({
  isLocked,
  enteredPin,
  setEnteredPin,
  onUnlock,
  onBiometricUnlock,
  biometricEnabled,
  pinLockEnabled,
}: {
  isLocked: boolean;
  enteredPin: string;
  setEnteredPin: (v: string) => void;
  onUnlock: () => void;
  onBiometricUnlock: () => void;
  biometricEnabled: boolean;
  pinLockEnabled: boolean;
}): React.JSX.Element {
  const { colors, isDark, currencySymbol, radius, spacing } = useAppTheme();
  const [detectedSms, setDetectedSms] = useState<DetectedSmsTransaction | null>(null);

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const url = event.url;
      if (!url) return;
      const [pathOnly, queryString] = url.replace(/^sera:\/\//, '').replace(/^\/+/, '').split('?');
      const cleanPath = pathOnly;
      const queryParams: Record<string, string> = {};
      if (queryString) {
        queryString.split('&').forEach(part => {
          const [k, v] = part.split('=');
          if (k) {
            try {
              queryParams[decodeURIComponent(k)] = decodeURIComponent(v || '');
            } catch (e) {
              queryParams[k] = v || '';
            }
          }
        });
      }

      if (cleanPath === 'add-expense' || cleanPath === 'add-income' || cleanPath === 'add-transfer') {
        const detectedType =
          cleanPath === 'add-transfer' || queryParams.type === 'transfer'
            ? 'transfer'
            : cleanPath === 'add-income' || queryParams.type === 'income'
            ? 'income'
            : 'expense';
        const initialAmount = queryParams.amount ? parseFloat(queryParams.amount) : undefined;
        const initialMerchant = queryParams.merchant || undefined;
        const initialCategoryId = queryParams.category || undefined;
        const initialNote = queryParams.note || undefined;
        const autoPromptConfirm = queryParams.autoPrompt === 'true';

        if (navigationRef.isReady()) {
          navigationRef.navigate('TransactionsTab', {
            screen: 'AddTransaction',
            params: {
              initialType: detectedType,
              initialAmount,
              initialMerchant,
              initialCategoryId,
              initialNote,
              autoPromptConfirm,
            },
          });
        }
      } else if (cleanPath === 'budgets') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('BudgetsTab');
        }
      } else if (cleanPath === 'goals') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('GoalsTab');
        }
      } else if (cleanPath === 'accounts') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('MoreTab', {
            screen: 'ManageAccounts',
          });
        }
      } else if (cleanPath === 'subscriptions') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('MoreTab', {
            screen: 'Subscriptions',
          });
        }
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = smsService.subscribeToSmsEvents((data: DetectedSmsTransaction) => {
      setDetectedSms(data);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAcceptSms = () => {
    if (!detectedSms) return;
    const sms = detectedSms;
    setDetectedSms(null);

    if (navigationRef.isReady()) {
      navigationRef.navigate('TransactionsTab', {
        screen: 'AddTransaction',
        params: {
          initialType: sms.type,
          initialAmount: sms.amount,
          initialMerchant: sms.merchant,
          initialCategoryId: sms.categoryId,
          initialNote: 'Auto-detected SMS',
          autoPromptConfirm: true,
        },
      });
    }
  };

  if (isLocked) {
    return (
      <View style={[styles.lockContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <FinanceGrid
          barsCount={20}
          height={40}
          minHeight={10}
          color={colors.gridLine}
          activeColor={colors.textPrimary}
          progress={0.7}
          style={{ marginBottom: 20 }}
        />
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 2, marginBottom: 8 }}>
          APPLICATION PROTECTED
        </AppText>
        <AppText variant="pageHeading" style={{ color: colors.textPrimary, marginBottom: 24 }}>
          {pinLockEnabled ? 'Enter 4-Digit PIN' : 'Biometric Security'}
        </AppText>

        {pinLockEnabled && (
          <>
            <TextInput
              value={enteredPin}
              onChangeText={setEnteredPin}
              placeholder="••••"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              style={[
                styles.lockPinInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              autoFocus={!biometricEnabled}
            />

            <AppButton
              title="UNLOCK WITH PIN"
              onPress={onUnlock}
              variant="primary"
              size="large"
              style={{ marginTop: 20, width: 220 }}
            />
          </>
        )}

        {biometricEnabled && (
          <TouchableOpacity
            onPress={onBiometricUnlock}
            activeOpacity={0.7}
            style={[
              styles.biometricLockBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                marginTop: pinLockEnabled ? 16 : 0,
              },
            ]}
          >
            <CategoryIcon name="Shield" size={20} color={colors.accent} strokeWidth={2.2} />
            <AppText variant="bodyLarge" style={{ color: colors.textPrimary, fontWeight: '600', marginLeft: 10 }}>
              Unlock with Biometrics
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.appWrapper, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootNavigator />
      </NavigationContainer>

      {/* In-App Realtime SMS Detection Modal */}
      <Modal visible={!!detectedSms} transparent animationType="fade">
        <View style={[styles.inAppModalBackdrop, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.inAppModalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={[styles.pulseIcon, { backgroundColor: colors.cardDark }]}>
                <CategoryIcon name="Zap" size={16} color={colors.accent} strokeWidth={2.4} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <AppText variant="label" style={{ color: colors.positive, letterSpacing: 1.5, fontWeight: '700' }}>
                  SMS TRANSACTION DETECTED
                </AppText>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary }}>
                  Record this {detectedSms?.type === 'transfer' ? 'transfer' : detectedSms?.type === 'income' ? 'income' : 'expense'}?
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.detectedDetailsBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  padding: spacing.md,
                  borderRadius: radius.xs,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <AppText variant="displayMedium" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  {currencySymbol}{detectedSms?.amountStr}
                </AppText>
                <AppText variant="bodyMedium" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {detectedSms?.merchant}
                </AppText>
              </View>
              {!!detectedSms?.rawText && (
                <AppText
                  variant="metadata"
                  numberOfLines={2}
                  style={{ color: colors.textSecondary, marginTop: 8 }}
                >
                  "{detectedSms.rawText}"
                </AppText>
              )}
            </View>

            <AppButton
              title={
                detectedSms?.type === 'transfer'
                  ? 'ADD TRANSFER TO SERA'
                  : detectedSms?.type === 'income'
                  ? 'ADD INCOME TO SERA'
                  : 'ADD EXPENSE TO SERA'
              }
              onPress={handleAcceptSms}
              variant="primary"
              size="large"
            />

            <TouchableOpacity
              onPress={() => setDetectedSms(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginTop: 12, alignItems: 'center', paddingVertical: 4 }}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                DISMISS
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appWrapper: {
    flex: 1,
  },
  lockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  lockPinInput: {
    width: 200,
    fontSize: 34,
    textAlign: 'center',
    letterSpacing: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  biometricLockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 4,
    minWidth: 220,
  },
  inAppModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inAppModalCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
  },
  pulseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectedDetailsBox: {
    borderWidth: 1,
  },
});
