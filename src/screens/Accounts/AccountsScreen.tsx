import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { AccountCard } from '../../components/finance/AccountCard';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { useAccountStore } from '../../store/useAccountStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AccountType } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface AccountsScreenProps {
  navigation: any;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { accounts, netWorth, loadAccounts, createAccount, isLoading } = useAccountStore();
  const settings = useSettingsStore(state => state.settings);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [institution, setInstitution] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  };

  const handleCreateAccount = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter an account name.');
      return;
    }
    const bal = parseFloat(balance) || 0;

    await createAccount({
      name: name.trim(),
      type,
      balance: bal,
      currency: settings.currency || 'INR',
      institution: institution.trim() || undefined,
    });

    setModalVisible(false);
    setName('');
    setBalance('');
    setInstitution('');
    Alert.alert('Account Created', `Created ${name} account.`);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        subtitle="FINANCIAL ACCOUNTS"
        title="Net Worth"
        rightAction={
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.plusBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            <CategoryIcon name="Plus" size={16} color={colors.textPrimary} strokeWidth={2.2} />
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
        {/* Net Worth Rectangular Card */}
        <View
          style={[
            styles.netWorthCard,
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
            TOTAL NET WORTH
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 2 }}
          >
            {formatCurrency(netWorth.netWorth, currencySymbol, isPrivacyMode, false)}
          </AppText>

          <View style={[styles.assetsLiabilitiesRow, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.sm }]}>
            <View>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                ASSETS
              </AppText>
              <AppText
                variant="amountSmall"
                privacySensitive
                style={{ color: colors.positive, fontWeight: '700', marginTop: 2 }}
              >
                {formatCurrency(netWorth.assets, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                LIABILITIES
              </AppText>
              <AppText
                variant="amountSmall"
                privacySensitive
                style={{ color: colors.coral, fontWeight: '700', marginTop: 2 }}
              >
                -{formatCurrency(netWorth.liabilities, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Transfer Money Action Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Transfer')}
          style={[
            styles.transferBanner,
            {
              backgroundColor: colors.accent,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CategoryIcon name="ArrowRightLeft" size={18} color={colors.accentText} />
            <AppText
              variant="label"
              style={{ color: colors.accentText, letterSpacing: 1.4, marginLeft: 8, fontWeight: '700' }}
            >
              TRANSFER MONEY BETWEEN ACCOUNTS
            </AppText>
          </View>
          <CategoryIcon name="ChevronRight" size={18} color={colors.accentText} />
        </TouchableOpacity>

        {/* Accounts List */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 8 }}>
          ALL ACCOUNTS ({accounts.length})
        </AppText>

        {accounts.map(acc => (
          <AccountCard
            key={acc.id}
            account={acc}
            onPress={() => {}}
            onPressTransfer={() => navigation.navigate('Transfer', { defaultFromId: acc.id })}
          />
        ))}

        <AppButton
          title="+ ADD NEW ACCOUNT"
          onPress={() => setModalVisible(true)}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.md, marginBottom: 30 }}
        />
      </ScrollView>

      {/* Add Account Modal */}
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
                styles.modalSheet,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                },
              ]}
            >
              <AppText variant="cardTitle" style={{ color: colors.textPrimary, marginBottom: spacing.md }}>
                Add New Account
              </AppText>

              <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                  ACCOUNT NAME
                </AppText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Axis Bank, Wallet, Gold"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.inputField, { color: colors.textPrimary }]}
                />
              </View>

              <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 10 }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                  STARTING BALANCE
                </AppText>
                <TextInput
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[styles.inputField, { color: colors.textPrimary }]}
                />
              </View>

              {/* Type selector */}
              <AppText variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 12, marginBottom: 6 }}>
                ACCOUNT TYPE
              </AppText>
              <View style={styles.typesRow}>
                {(['bank', 'cash', 'credit', 'investment', 'wallet'] as const).map(t => {
                  const isSelected = type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: isSelected ? colors.accentRed : colors.surface,
                          borderColor: isSelected ? colors.accentRed : colors.border,
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
                        {t.toUpperCase()}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppButton
                title="CREATE ACCOUNT"
                onPress={handleCreateAccount}
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
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netWorthCard: {
    borderWidth: 1,
  },
  assetsLiabilitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transferBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
  },
  inputBox: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
  },
  inputField: {
    fontSize: 16,
    marginTop: 4,
    paddingVertical: 0,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
});
