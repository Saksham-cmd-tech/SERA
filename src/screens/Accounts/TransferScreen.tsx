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
      <Header showBack onPressBack={() => navigation.goBack()} subtitle="Accounts" title="Transfer Funds" />

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
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          <AppText variant="sectionHeading" style={{ color: colors.textSecondary }}>
            FROM (SOURCE)
          </AppText>
          <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 18, marginTop: 4, fontWeight: '600' }}>
            {fromAccount?.name}
          </AppText>
          <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
            Available: {formatCurrency(fromAccount?.balance || 0, currencySymbol, false, false)}
          </AppText>

          {/* Account selector chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {accounts.map(acc => {
              const isSelected = fromAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.7}
                  onPress={() => setFromAccountId(acc.id)}
                  style={[
                    styles.accountChip,
                    {
                      backgroundColor: isSelected ? colors.accentRed : colors.surfaceLighter,
                      borderRadius: radius.full,
                      marginRight: 8,
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
                    {acc.name}
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
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 20,
              },
            ]}
          >
            <CategoryIcon name="ArrowRightLeft" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Destination Account (TO) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="sectionHeading" style={{ color: colors.textSecondary }}>
            TO (DESTINATION)
          </AppText>
          <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 18, marginTop: 4, fontWeight: '600' }}>
            {toAccount?.name}
          </AppText>
          <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
            Current: {formatCurrency(toAccount?.balance || 0, currencySymbol, false, false)}
          </AppText>

          {/* Account selector chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {accounts.map(acc => {
              const isSelected = toAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.7}
                  onPress={() => setToAccountId(acc.id)}
                  style={[
                    styles.accountChip,
                    {
                      backgroundColor: isSelected ? colors.accentRed : colors.surfaceLighter,
                      borderRadius: radius.full,
                      marginRight: 8,
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
                    {acc.name}
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
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <AppText variant="sectionHeading" style={{ color: colors.textSecondary }}>
            TRANSFER NOTE
          </AppText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. ATM withdrawal, Credit card payment"
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
          title="Confirm Transfer"
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
  card: {},
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  largeInput: {
    flex: 1,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '700',
    paddingVertical: 0,
    marginLeft: 6,
  },
  accountChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  swapRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  swapButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoInput: {
    fontSize: 15,
    marginTop: 6,
    paddingVertical: 0,
  },
});
