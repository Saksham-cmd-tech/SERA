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
        subtitle="Accounts"
        title="Net Worth"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.plusBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <CategoryIcon name="Plus" size={17} color={colors.textPrimary} strokeWidth={2.2} />
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
        {/* Apple Card Net Worth Hero */}
        <View
          style={[
            styles.netWorthCard,
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
            TOTAL NET WORTH
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 4 }}
          >
            {formatCurrency(netWorth.netWorth, currencySymbol, isPrivacyMode, false)}
          </AppText>

          <View style={[styles.assetsLiabilitiesRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingTop: spacing.sm + 2 }]}>
            <View>
              <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
                TOTAL ASSETS
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
              <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
                TOTAL LIABILITIES
              </AppText>
              <AppText
                variant="amountSmall"
                privacySensitive
                style={{ color: colors.accentRed, fontWeight: '700', marginTop: 2 }}
              >
                -{formatCurrency(netWorth.liabilities, currencySymbol, isPrivacyMode, false)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Transfer Action Row */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Transfer')}
          style={[
            styles.transferBanner,
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
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 122, 255, 0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CategoryIcon name="ArrowRightLeft" size={16} color="#007AFF" />
            </View>
            <AppText
              variant="bodyLarge"
              style={{ color: colors.textPrimary, marginLeft: 12, fontWeight: '600' }}
            >
              Transfer Between Accounts
            </AppText>
          </View>
          <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Accounts List */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 10 }}>
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
          title="Add New Account"
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
                Add New Account
              </AppText>

              <View style={[styles.inputBox, { backgroundColor: colors.surfaceLighter }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
                  ACCOUNT NAME
                </AppText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. HDFC Bank, Cash Wallet, Savings"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.inputField, { color: colors.textPrimary }]}
                />
              </View>

              <View style={[styles.inputBox, { backgroundColor: colors.surfaceLighter, marginTop: 10 }]}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
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
              <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginTop: 14, marginBottom: 8 }}>
                ACCOUNT TYPE
              </AppText>
              <View style={styles.typesRow}>
                {(['bank', 'cash', 'credit', 'investment', 'wallet'] as const).map(t => {
                  const isSelected = type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      activeOpacity={0.7}
                      onPress={() => setType(t)}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: isSelected ? colors.accentRed : colors.surfaceLighter,
                          borderRadius: radius.full,
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
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppButton
                title="Create Account"
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netWorthCard: {
    gap: 4,
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
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
  inputBox: {
    padding: 12,
    borderRadius: 12,
  },
  inputField: {
    fontSize: 16,
    marginTop: 4,
    paddingVertical: 0,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
