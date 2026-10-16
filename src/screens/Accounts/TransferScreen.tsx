import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useKeyboardBottomInset } from '../../hooks/useKeyboardBottomInset';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useAccountStore } from '../../store/useAccountStore';
import { formatCurrency } from '../../utils/currency';

interface TransferScreenProps {
  navigation: any;
  route?: {
    params?: {
      defaultFromId?: string;
    };
  };
}

export const TransferScreen: React.FC<TransferScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, spacing, radius, currencySymbol } = useAppTheme();
  const { accounts, transferFunds } = useAccountStore();

  const defaultFromId = route?.params?.defaultFromId || accounts[0]?.id || '';
  const defaultToId =
    accounts.find(a => a.id !== defaultFromId)?.id || accounts[1]?.id || '';

  const [fromAccountId, setFromAccountId] = useState(defaultFromId);
  const [toAccountId, setToAccountId] = useState(defaultToId);
  const [amountStr, setAmountStr] = useState('');
  const [notes, setNotes] = useState('');

  const scrollRef = useRef<any>(null);
  const keyboardPadding = useKeyboardBottomInset(30);

  useEffect(() => {
    if (accounts.length > 0) {
      if (!fromAccountId || !accounts.some(a => a.id === fromAccountId)) {
        setFromAccountId(accounts[0].id);
      }
      if (!toAccountId || !accounts.some(a => a.id === toAccountId) || toAccountId === fromAccountId) {
        const alt = accounts.find(a => a.id !== (fromAccountId || accounts[0].id));
        if (alt) setToAccountId(alt.id);
      }
    }
  }, [accounts, fromAccountId, toAccountId]);

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);

  const handleSwap = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const handleExecuteTransfer = async () => {
    if (fromAccountId === toAccountId) {
      Alert.alert('Invalid Transfer', 'Source and destination accounts must be different.');
      return;
    }

    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than 0.');
      return;
    }

    try {
      await transferFunds(fromAccountId, toAccountId, amount, notes.trim() || undefined);
      Alert.alert(
        'Transfer Complete',
        `Successfully transferred ${currencySymbol}${amount} from ${fromAccount?.name} to ${toAccount?.name}.`
      );
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Transfer failed.');
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header showBack onPressBack={() => navigation.goBack()} subtitle="ACCOUNTS" title="Transfer Funds" />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.screenPadding,
            paddingTop: spacing.md,
            paddingBottom: Math.max(keyboardPadding, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Large Amount Input Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.4 }}>
            TRANSFER AMOUNT
          </AppText>
          <View style={styles.amountInputRow}>
            <AppText variant="displayLarge" style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {currencySymbol}
            </AppText>
            <TextInput
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }, 150);
              }}
              style={[styles.largeInput, { color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Source Account (FROM) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.4 }}>
            FROM (SOURCE)
          </AppText>
          <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 18, marginTop: 4 }}>
            {fromAccount?.name}
          </AppText>
          <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
            Balance: {formatCurrency(fromAccount?.balance || 0, currencySymbol, false, false)}
          </AppText>

          {/* Account selector chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {accounts.map(acc => {
              const isSelected = fromAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => setFromAccountId(acc.id)}
                  style={[
                    styles.accountChip,
                    {
                      backgroundColor: isSelected ? colors.accentRed : colors.surface,
                      borderColor: isSelected ? colors.accentRed : colors.border,
                      borderRadius: radius.xs,
                      marginRight: 6,
                    },
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {acc.name.toUpperCase()}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Swap Button */}
        <View style={styles.swapRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSwap}
            style={[
              styles.swapButton,
              { backgroundColor: colors.accent, borderColor: colors.border, borderRadius: radius.xs },
            ]}
          >
            <CategoryIcon name="ArrowRightLeft" size={16} color={colors.accentText} />
          </TouchableOpacity>
        </View>

        {/* Destination Account (TO) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.4 }}>
            TO (DESTINATION)
          </AppText>
          <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 18, marginTop: 4 }}>
            {toAccount?.name}
          </AppText>
          <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
            Balance: {formatCurrency(toAccount?.balance || 0, currencySymbol, false, false)}
          </AppText>

          {/* Account selector chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {accounts.map(acc => {
              const isSelected = toAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => setToAccountId(acc.id)}
                  style={[
                    styles.accountChip,
                    {
                      backgroundColor: isSelected ? colors.accentRed : colors.surface,
                      borderColor: isSelected ? colors.accentRed : colors.border,
                      borderRadius: radius.xs,
                      marginRight: 6,
                    },
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {acc.name.toUpperCase()}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Notes Input */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.4 }}>
            TRANSFER MEMO
          </AppText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. ATM cash withdrawal, CC payment"
            placeholderTextColor={colors.textMuted}
            onFocus={() => {
              setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }, 150);
            }}
            style={[styles.memoInput, { color: colors.textPrimary }]}
          />
        </View>

        {/* Action Button */}
        <AppButton
          title="EXECUTE TRANSFER"
          onPress={handleExecuteTransfer}
          variant="primary"
          size="large"
          style={{ marginBottom: 30 }}
        />
      </ScrollView>
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
  card: {
    borderWidth: 1,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  largeInput: {
    flex: 1,
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '700',
    paddingVertical: 0,
    marginLeft: 4,
  },
  accountChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  swapRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  swapButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  memoInput: {
    fontSize: 15,
    marginTop: 6,
    paddingVertical: 0,
  },
});
