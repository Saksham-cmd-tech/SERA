import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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
      await db.initDatabase();
      await Promise.all([
        loadSettings(),
        loadAccounts(),
        loadTransactions(),
        loadBudgetSummary(),
        loadGoals(),
        loadCategories(),
        loadSubscriptions(),
      ]);
      setDbReady(true);
    }
    setup();
  }, [
    loadSettings,
    loadAccounts,
    loadTransactions,
    loadBudgetSummary,
    loadGoals,
    loadCategories,
    loadSubscriptions,
  ]);

  useEffect(() => {
    if (settings.pinLockEnabled && settings.pinCode) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [settings.pinLockEnabled, settings.pinCode]);

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
      <AppContent isLocked={isLocked} enteredPin={enteredPin} setEnteredPin={setEnteredPin} onUnlock={handleUnlock} />
    </SafeAreaProvider>
  );
}

function AppContent({
  isLocked,
  enteredPin,
  setEnteredPin,
  onUnlock,
}: {
  isLocked: boolean;
  enteredPin: string;
  setEnteredPin: (v: string) => void;
  onUnlock: () => void;
}): React.JSX.Element {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[styles.appWrapper, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>

      {/* Security PIN Lock Screen */}
      <Modal visible={isLocked} transparent={false} animationType="fade">
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
            Enter 4-Digit PIN
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
              styles.lockPinInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            autoFocus
          />

          <AppButton
            title="UNLOCK APP"
            onPress={onUnlock}
            variant="primary"
            size="large"
            style={{ marginTop: 24, width: 200 }}
          />
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
});
