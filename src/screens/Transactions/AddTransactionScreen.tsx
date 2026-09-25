import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { SegmentedControl } from '../../components/forms/SegmentedControl';
import { NumericKeypad } from '../../components/forms/NumericKeypad';
import { AppButton } from '../../components/common/AppButton';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { TransactionType } from '../../types';
import { getCurrentTimeString, getTodayDateString } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';

interface AddTransactionScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialType?: TransactionType;
      initialCategoryId?: string;
    };
  };
}

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, spacing, radius, currencySymbol } = useAppTheme();

  const initialType = route?.params?.initialType || 'expense';
  const initialCategoryId = route?.params?.initialCategoryId;

  const { createTransaction } = useTransactionStore();
  const categories = useCategoryStore(state => state.categories);
  const accounts = useAccountStore(state => state.accounts);
  const settings = useSettingsStore(state => state.settings);

  // Form State
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('0');
  const [merchant, setMerchant] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(
    initialCategoryId || settings.defaultCategoryId || (categories[0]?.id || 'cat-food')
  );
  const [accountId, setAccountId] = useState<string>(
    settings.defaultAccountId || (accounts[0]?.id || 'acc-hdfc')
  );
  const [toAccountId, setToAccountId] = useState<string>(
    accounts[1]?.id || accounts[0]?.id || 'acc-cash'
  );
  const [date, _setDate] = useState<string>(getTodayDateString());
  const [time, _setTime] = useState<string>(getCurrentTimeString());
  const [notes, setNotes] = useState<string>('');
  const [receiptAttached, setReceiptAttached] = useState<boolean>(false);
  const [keypadVisible, setKeypadVisible] = useState<boolean>(true);
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [accountModalVisible, setAccountModalVisible] = useState<boolean>(false);
  const [targetAccountField, setTargetAccountField] = useState<'from' | 'to'>('from');

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedAccount = accounts.find(a => a.id === accountId);
  const selectedToAccount = accounts.find(a => a.id === toAccountId);

  // Keypad handling
  const handleKeyPress = (char: string) => {
    if (char === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(amountStr + '.');
      }
      return;
    }

    if (amountStr === '0') {
      setAmountStr(char);
    } else {
      // Limit to 2 decimal places if decimal exists
      if (amountStr.includes('.')) {
        const parts = amountStr.split('.');
        if (parts[1].length >= 2) return;
      }
      // Maximum safe length
      if (amountStr.length >= 8) return;
      setAmountStr(amountStr + char);
    }
  };

  const handleDelete = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0');
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amountStr);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    const finalMerchant =
      merchant.trim() ||
      (type === 'transfer'
        ? `Transfer to ${selectedToAccount?.name || 'Account'}`
        : selectedCategory?.name || 'Expense');

    try {
      await createTransaction({
        type,
        amount: numAmount,
        categoryId: type === 'transfer' ? 'cat-other' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        merchant: finalMerchant,
        description: notes.trim() || undefined,
        date,
        time,
        currency: selectedAccount?.currency || 'INR',
        receiptUri: receiptAttached ? 'sample_receipt_stored' : undefined,
      });

      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save transaction.');
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header
          showBack
          onPressBack={() => navigation.goBack()}
          subtitle="QUICK ENTRY"
          title="Add Transaction"
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Segmented Selector */}
        <View style={{ marginBottom: spacing.md }}>
          <SegmentedControl
            options={[
              { value: 'expense', label: 'EXPENSE' },
              { value: 'income', label: 'INCOME' },
              { value: 'transfer', label: 'TRANSFER' },
            ]}
            selectedValue={type}
            onSelect={val => setType(val)}
          />
        </View>

        {/* Large Amount Display */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setKeypadVisible(true)}
          style={[
            styles.amountContainer,
            {
              backgroundColor: colors.surface,
              borderColor: keypadVisible ? colors.textPrimary : colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText
            variant="labelSmall"
            style={{ color: colors.textSecondary, letterSpacing: 1.6 }}
          >
            AMOUNT
          </AppText>
          <View style={styles.amountDisplayRow}>
            <AppText
              variant="displayLarge"
              style={[
                styles.amountText,
                {
                  color:
                    type === 'expense'
                      ? colors.textPrimary
                      : type === 'income'
                      ? colors.positive
                      : colors.textPrimary,
                },
              ]}
            >
              {currencySymbol}{amountStr}
            </AppText>
          </View>
        </TouchableOpacity>

        {/* Custom Large Fast Keypad */}
        {keypadVisible && (
          <View style={{ marginBottom: spacing.md }}>
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
            />
          </View>
        )}

        {/* Form Fields Section */}
        <View
          style={[
            styles.fieldsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          {/* Merchant / Description Input */}
          <View style={styles.fieldRow}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 80 }}>
              MERCHANT
            </AppText>
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder={type === 'transfer' ? 'Internal Transfer' : 'Store or Payee Name'}
              placeholderTextColor={colors.textMuted}
              style={[styles.fieldInput, { color: colors.textPrimary }]}
              onFocus={() => setKeypadVisible(false)}
            />
          </View>

          {/* Category Selector (hidden for transfer) */}
          {type !== 'transfer' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCategoryModalVisible(true)}
              style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 80 }}>
                CATEGORY
              </AppText>
              <View style={styles.pickerSelector}>
                <View
                  style={[
                    styles.smallIconCircle,
                    { backgroundColor: colors.cardDark, marginRight: 8 },
                  ]}
                >
                  <CategoryIcon
                    name={selectedCategory?.icon || 'Tag'}
                    size={14}
                    color={colors.textInverted}
                  />
                </View>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 15 }}>
                  {selectedCategory?.name || 'Select Category'}
                </AppText>
              </View>
              <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Account Selector */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setTargetAccountField('from');
              setAccountModalVisible(true);
            }}
            style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}
          >
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 80 }}>
              {type === 'transfer' ? 'FROM' : 'ACCOUNT'}
            </AppText>
            <View style={styles.pickerSelector}>
              <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 15 }}>
                {selectedAccount?.name || 'Select Account'}
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginLeft: 6 }}>
                ({formatCurrency(selectedAccount?.balance || 0, currencySymbol, false, false)})
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Destination Account for Transfer */}
          {type === 'transfer' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setTargetAccountField('to');
                setAccountModalVisible(true);
              }}
              style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 80 }}>
                TO
              </AppText>
              <View style={styles.pickerSelector}>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 15 }}>
                  {selectedToAccount?.name || 'Select Account'}
                </AppText>
                <AppText variant="metadata" style={{ color: colors.textSecondary, marginLeft: 6 }}>
                  ({formatCurrency(selectedToAccount?.balance || 0, currencySymbol, false, false)})
                </AppText>
              </View>
              <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Date & Time display */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 80 }}>
              DATE / TIME
            </AppText>
            <AppText variant="bodyMedium" style={{ color: colors.textPrimary }}>
              {date} • {time}
            </AppText>
          </View>

          {/* Notes Input */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 80 }}>
              NOTES
            </AppText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional transaction memo"
              placeholderTextColor={colors.textMuted}
              style={[styles.fieldInput, { color: colors.textPrimary }]}
              onFocus={() => setKeypadVisible(false)}
            />
          </View>

          {/* Receipt Attachment Toggle */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setReceiptAttached(!receiptAttached)}
            style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}
          >
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 80 }}>
              RECEIPT
            </AppText>
            <View style={styles.pickerSelector}>
              <CategoryIcon
                name="Camera"
                size={16}
                color={receiptAttached ? colors.positive : colors.textSecondary}
              />
              <AppText
                variant="bodyMedium"
                style={{
                  color: receiptAttached ? colors.positive : colors.textSecondary,
                  marginLeft: 8,
                }}
              >
                {receiptAttached ? 'Receipt Attached ✓' : 'Attach Receipt Image'}
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <AppButton
          title="SAVE TRANSACTION"
          onPress={handleSave}
          variant="primary"
          size="large"
          style={{ marginBottom: 30 }}
        />
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.pickerSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
              },
            ]}
          >
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: spacing.md }}
            >
              SELECT CATEGORY
            </AppText>

            <ScrollView style={{ maxHeight: 380 }}>
              <View style={styles.categoriesGrid}>
                {categories.map(c => {
                  const isSelected = categoryId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setCategoryId(c.id);
                        setCategoryModalVisible(false);
                      }}
                      style={[
                        styles.categoryGridItem,
                        {
                          backgroundColor: isSelected ? colors.accent : colors.background,
                          borderColor: colors.border,
                          borderRadius: radius.xs,
                        },
                      ]}
                    >
                      <CategoryIcon
                        name={c.icon}
                        size={20}
                        color={isSelected ? colors.accentText : colors.textPrimary}
                      />
                      <AppText
                        variant="labelSmall"
                        style={{
                          color: isSelected ? colors.accentText : colors.textPrimary,
                          marginTop: 6,
                          textAlign: 'center',
                        }}
                      >
                        {c.name.toUpperCase()}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Account Picker Modal */}
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setAccountModalVisible(false)}
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.pickerSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
              },
            ]}
          >
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: spacing.md }}
            >
              SELECT {targetAccountField === 'from' ? 'ACCOUNT' : 'DESTINATION ACCOUNT'}
            </AppText>

            {accounts.map(acc => {
              const currentVal = targetAccountField === 'from' ? accountId : toAccountId;
              const isSelected = currentVal === acc.id;

              return (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (targetAccountField === 'from') {
                      setAccountId(acc.id);
                    } else {
                      setToAccountId(acc.id);
                    }
                    setAccountModalVisible(false);
                  }}
                  style={[
                    styles.accountRowOption,
                    {
                      backgroundColor: isSelected ? colors.cardDark : colors.background,
                      borderColor: colors.border,
                      borderRadius: radius.xs,
                      marginBottom: 8,
                    },
                  ]}
                >
                  <View>
                    <AppText
                      variant="cardTitle"
                      style={{
                        color: isSelected ? colors.textInverted : colors.textPrimary,
                        fontSize: 15,
                      }}
                    >
                      {acc.name}
                    </AppText>
                    <AppText
                      variant="metadata"
                      style={{
                        color: isSelected ? colors.textInverted : colors.textSecondary,
                      }}
                    >
                      {acc.type.toUpperCase()}
                    </AppText>
                  </View>
                  <AppText
                    variant="amountSmall"
                    style={{
                      color: isSelected ? colors.textInverted : colors.textPrimary,
                    }}
                  >
                    {formatCurrency(acc.balance, currencySymbol, false, false)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
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
  amountContainer: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountDisplayRow: {
    marginVertical: 8,
  },
  amountText: {
    fontWeight: '700',
    fontSize: 48,
    lineHeight: 52,
  },
  fieldsCard: {
    borderWidth: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  pickerSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryGridItem: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  accountRowOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
  },
});
