import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useKeyboardBottomInset } from '../../hooks/useKeyboardBottomInset';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { SegmentedControl } from '../../components/forms/SegmentedControl';
import { NumericKeypad } from '../../components/forms/NumericKeypad';
import { AppButton } from '../../components/common/AppButton';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGoalStore } from '../../store/useGoalStore';
import { notificationService } from '../../services/notificationService';
import { widgetService } from '../../services/widgetService';
import { TransactionType } from '../../types';
import { getCurrentTimeString, getTodayDateString } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { promptReceiptOptions } from '../../utils/receiptPicker';
import { parseExpenseText, ParsedExpenseResult } from '../../utils/expenseParser';

interface AddTransactionScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialType?: TransactionType;
      initialCategoryId?: string;
      initialAmount?: number;
      initialMerchant?: string;
      initialNote?: string;
      autoPromptConfirm?: boolean;
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
  const budgetSummary = useBudgetStore(state => state.summary);

  // Form State
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>(
    route?.params?.initialAmount ? route.params.initialAmount.toString() : '0'
  );
  const [merchant, setMerchant] = useState<string>(route?.params?.initialMerchant || '');
  const [categoryId, setCategoryId] = useState<string>(
    initialCategoryId || settings.defaultCategoryId || (categories[0]?.id || 'cat-food')
  );
  const [accountId, setAccountId] = useState<string>(
    settings.defaultAccountId || accounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState<string>(
    accounts[1]?.id || accounts[0]?.id || ''
  );
  const [date, _setDate] = useState<string>(getTodayDateString());
  const [time, _setTime] = useState<string>(getCurrentTimeString());
  const [notes, setNotes] = useState<string>(route?.params?.initialNote || '');
  const [receiptUri, setReceiptUri] = useState<string | undefined>(undefined);
  const [keypadVisible, setKeypadVisible] = useState<boolean>(true);
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [accountModalVisible, setAccountModalVisible] = useState<boolean>(false);
  const [targetAccountField, setTargetAccountField] = useState<'from' | 'to'>('from');
  const [smartFillVisible, setSmartFillVisible] = useState<boolean>(false);
  const [smartInput, setSmartInput] = useState<string>('');

  const scrollRef = useRef<any>(null);
  const keyboardPadding = useKeyboardBottomInset(30);

  useEffect(() => {
    if (route?.params?.initialAmount) {
      setAmountStr(route.params.initialAmount.toString());
    }
    if (route?.params?.initialMerchant) {
      setMerchant(route.params.initialMerchant);
    }
    if (route?.params?.initialNote) {
      setNotes(route.params.initialNote);
    }
    if (route?.params?.initialCategoryId) {
      setCategoryId(route.params.initialCategoryId);
    }
    if (route?.params?.initialType) {
      setType(route.params.initialType);
    }
  }, [
    route?.params?.initialAmount,
    route?.params?.initialMerchant,
    route?.params?.initialNote,
    route?.params?.initialCategoryId,
    route?.params?.initialType,
  ]);

  const parsedResult: ParsedExpenseResult | null = smartInput.trim()
    ? parseExpenseText(smartInput, categories, accounts)
    : null;

  const handleApplySmartFill = (res?: ParsedExpenseResult | null) => {
    const toApply = res || parsedResult;
    if (!toApply || !toApply.amount || toApply.amount <= 0) {
      Alert.alert(
        'No Amount Detected',
        'Could not find a valid expense amount in the text. Please make sure the text includes an amount (e.g. ₹350 or 450).'
      );
      return;
    }

    setType(toApply.type);
    setAmountStr(toApply.amount.toString());
    if (toApply.merchant) {
      setMerchant(toApply.merchant);
    }
    if (toApply.categoryId) {
      setCategoryId(toApply.categoryId);
    }
    if (toApply.accountId) {
      setAccountId(toApply.accountId);
    }
    if (toApply.notes) {
      setNotes(toApply.notes);
    }
    setSmartFillVisible(false);
    setSmartInput('');
    setKeypadVisible(false);
  };

  const handleAddIncrement = (increment: number) => {
    const current = parseFloat(amountStr) || 0;
    const next = current + increment;
    setAmountStr(next.toString());
  };

  useEffect(() => {
    if (accounts.length > 0) {
      if (!accountId || !accounts.some(a => a.id === accountId)) {
        const defaultAcc = accounts.find(a => a.id === settings.defaultAccountId) || accounts[0];
        setAccountId(defaultAcc.id);
      }
      if (!toAccountId || !accounts.some(a => a.id === toAccountId)) {
        const secondary = accounts.find(a => a.id !== (settings.defaultAccountId || accounts[0]?.id)) || accounts[0];
        setToAccountId(secondary.id);
      }
    }
  }, [accounts, settings.defaultAccountId, accountId, toAccountId]);

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

    const effectiveAccountId = accounts.some(a => a.id === accountId) ? accountId : accounts[0]?.id;
    if (!effectiveAccountId) {
      Alert.alert('No Account', 'Please add or select a valid account first.');
      return;
    }

    let effectiveToAccountId: string | undefined = undefined;
    if (type === 'transfer') {
      effectiveToAccountId = accounts.some(a => a.id === toAccountId && a.id !== effectiveAccountId)
        ? toAccountId
        : accounts.find(a => a.id !== effectiveAccountId)?.id;

      if (!effectiveToAccountId) {
        Alert.alert('Invalid Transfer', 'You need at least two accounts to perform a transfer.');
        return;
      }
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
        accountId: effectiveAccountId,
        toAccountId: effectiveToAccountId,
        merchant: finalMerchant,
        description: notes.trim() || undefined,
        date,
        time,
        currency: selectedAccount?.currency || settings.currency || 'INR',
        receiptUri: receiptUri || undefined,
      });

      if (settings.notificationsEnabled ?? true) {
        notificationService.sendTransactionAlert(
          type,
          numAmount,
          finalMerchant,
          selectedAccount?.name || 'Account',
          selectedToAccount?.name,
          currencySymbol
        );
      }

      if (type === 'expense' && (settings.budgetAlertsEnabled ?? true)) {
        const cat = budgetSummary?.categoryAnalysis?.find(c => c.categoryId === categoryId);
        if (cat && cat.limitAmount > 0) {
          const newSpent = cat.spentAmount + numAmount;
          if (newSpent >= cat.limitAmount) {
            notificationService.sendBudgetAlert(
              selectedCategory?.name || 'Category',
              newSpent,
              cat.limitAmount,
              currencySymbol
            );
          }
        }
      }

      widgetService.syncWidgets({
        currencySymbol,
        accounts: useAccountStore.getState().accounts,
        transactions: useTransactionStore.getState().transactions,
        budgetSummary: useBudgetStore.getState().summary,
        goals: useGoalStore.getState().goals,
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
      <Header
        cancelText="Cancel"
        onPressCancel={() => navigation.goBack()}
        title="Add Transaction"
        centerTitle
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSmartFillVisible(true)}
            style={[
              styles.receiptScanBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 18,
                width: 36,
                height: 36,
              },
            ]}
          >
            <CategoryIcon name="Receipt" size={17} color={colors.textPrimary} />
          </TouchableOpacity>
        }
      />

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
        {/* Type Segmented Selector */}
        <View style={{ marginBottom: spacing.md }}>
          <SegmentedControl
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
              { value: 'transfer', label: 'Transfer' },
            ]}
            selectedValue={type}
            onSelect={val => setType(val)}
          />
        </View>

        {/* Smart Text Parser Action Bar */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSmartFillVisible(true)}
          style={[
            styles.smartFillBar,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              paddingVertical: 12,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 149, 0, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CategoryIcon name="Zap" size={14} color={colors.warning} strokeWidth={2.4} />
            </View>
            <AppText
              variant="bodyMedium"
              style={{
                color: colors.textPrimary,
                fontWeight: '600',
                marginLeft: 10,
              }}
            >
              Smart Text Parser
            </AppText>
          </View>
          <AppText variant="metadata" style={{ color: colors.accentRed, fontWeight: '600' }}>
            Auto-Parse →
          </AppText>
        </TouchableOpacity>

        {/* Large Amount Display */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setKeypadVisible(true)}
          style={[
            styles.amountContainer,
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, width: '100%' }}>
            <AppText
              variant="sectionHeading"
              style={{ color: colors.textSecondary }}
            >
              AMOUNT
            </AppText>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setKeypadVisible(!keypadVisible)}>
              <AppText variant="labelSmall" style={{ color: colors.accentRed, fontWeight: '600' }}>
                {keypadVisible ? 'Hide Keypad' : 'Show Keypad'}
              </AppText>
            </TouchableOpacity>
          </View>
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

          {/* Quick Increment Chips */}
          <View style={styles.incrementRow}>
            {[100, 500, 1000, 5000].map(val => (
              <TouchableOpacity
                key={val}
                activeOpacity={0.7}
                onPress={() => handleAddIncrement(val)}
                style={[
                  styles.incrementChip,
                  {
                    backgroundColor: colors.surfaceLighter,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <AppText
                  variant="labelSmall"
                  style={{ color: colors.textPrimary, fontWeight: '600' }}
                >
                  +{val >= 1000 ? `${val.toLocaleString()}` : val}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>

        {/* Form Fields Section */}
        <View
          style={[
            styles.fieldsCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderLight,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          {/* Account Selector */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setTargetAccountField('from');
              setAccountModalVisible(true);
            }}
            style={styles.fieldRow}
          >
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 90, fontWeight: '500' }}>
              {type === 'transfer' ? 'From' : 'Account'}
            </AppText>
            <View style={styles.pickerSelector}>
              <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}>
                {selectedAccount?.name || 'Select Account'}
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary, marginLeft: 6 }}>
                ({formatCurrency(selectedAccount?.balance || 0, currencySymbol, false, false)})
              </AppText>
            </View>
            <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Category Selector (hidden for transfer) */}
          {type !== 'transfer' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCategoryModalVisible(true)}
              style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}
            >
              <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 90, fontWeight: '500' }}>
                Category
              </AppText>
              <View style={styles.pickerSelector}>
                <View
                  style={[
                    styles.smallIconCircle,
                    { backgroundColor: colors.surfaceLighter, marginRight: 8, borderRadius: 10 },
                  ]}
                >
                  <CategoryIcon
                    name={selectedCategory?.icon || 'Tag'}
                    size={14}
                    color={colors.textPrimary}
                  />
                </View>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}>
                  {selectedCategory?.name || 'Select Category'}
                </AppText>
              </View>
              <CategoryIcon name="ChevronRight" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Merchant / Description Input */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 90, fontWeight: '500' }}>
              Payee
            </AppText>
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder={type === 'transfer' ? 'Internal Transfer' : 'Store or Payee Name'}
              placeholderTextColor={colors.textMuted}
              style={[styles.fieldInput, { color: colors.textPrimary }]}
              onFocus={() => {
                setKeypadVisible(false);
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 320, animated: true });
                }, 150);
              }}
            />
          </View>

          {/* Destination Account for Transfer */}
          {type === 'transfer' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setTargetAccountField('to');
                setAccountModalVisible(true);
              }}
              style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}
            >
              <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 90, fontWeight: '500' }}>
                To
              </AppText>
              <View style={styles.pickerSelector}>
                <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}>
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
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 90, fontWeight: '500' }}>
              Date
            </AppText>
            <AppText variant="bodyMedium" style={{ color: colors.textPrimary }}>
              {date} • {time}
            </AppText>
          </View>

          {/* Notes Input */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 90, fontWeight: '500' }}>
              Note
            </AppText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional transaction memo"
              placeholderTextColor={colors.textMuted}
              style={[styles.fieldInput, { color: colors.textPrimary }]}
              onFocus={() => {
                setKeypadVisible(false);
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 440, animated: true });
                }, 150);
              }}
            />
          </View>

          {/* Receipt Attachment Section */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={styles.receiptHeaderRow}>
              <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 90, fontWeight: '500' }}>
                Receipt
              </AppText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => promptReceiptOptions(uri => setReceiptUri(uri))}
                style={styles.attachBtn}
              >
                <CategoryIcon
                  name="Camera"
                  size={16}
                  color={receiptUri ? colors.positive : colors.accentRed}
                />
                <AppText
                  variant="bodyMedium"
                  style={{
                    color: receiptUri ? colors.positive : colors.accentRed,
                    marginLeft: 6,
                    fontWeight: '600',
                  }}
                >
                  {receiptUri ? 'Change Photo' : 'Attach Photo / Receipt'}
                </AppText>
              </TouchableOpacity>
            </View>

            {receiptUri ? (
              <View style={[styles.receiptPreviewBox, { borderColor: colors.borderLight, backgroundColor: colors.surfaceLighter, borderRadius: radius.md }]}>
                <Image source={{ uri: receiptUri }} style={styles.receiptThumb} resizeMode="cover" />
                <View style={styles.receiptInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CategoryIcon name="CheckCircle2" size={14} color={colors.positive} />
                    <AppText variant="labelSmall" style={{ color: colors.positive, fontWeight: '700', marginLeft: 4 }}>
                      Attached
                    </AppText>
                  </View>
                  <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
                    Ready to save with transaction
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setReceiptUri(undefined)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginTop: 6 }}
                  >
                    <AppText variant="labelSmall" style={{ color: colors.accentRed, fontWeight: '700' }}>
                      Remove Receipt
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Quick Categories Bar */}
        {type !== 'transfer' && (
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <AppText variant="sectionHeading" style={{ color: colors.textSecondary }}>
                QUICK CATEGORIES
              </AppText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 2 }}>
              {categories.slice(0, 7).map(c => {
                const isSelected = categoryId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    activeOpacity={0.7}
                    onPress={() => setCategoryId(c.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? colors.accentRed : colors.surfaceCard,
                      borderColor: colors.borderLight,
                      borderWidth: isSelected ? 0 : StyleSheet.hairlineWidth,
                      borderRadius: radius.full,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    <CategoryIcon
                      name={c.icon}
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                    <AppText
                      variant="labelSmall"
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                        marginLeft: 6,
                        fontSize: 12,
                      }}
                    >
                      {c.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Custom Large Fast Keypad */}
        {keypadVisible && (
          <View style={{ marginBottom: spacing.md }}>
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
            />
          </View>
        )}

        {/* Save Button */}
        <AppButton
          title={
            type === 'expense'
              ? `Save Expense • ${currencySymbol}${amountStr}`
              : type === 'income'
              ? `Save Income • ${currencySymbol}${amountStr}`
              : `Confirm Transfer • ${currencySymbol}${amountStr}`
          }
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
                borderRadius: radius.xl,
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
                          backgroundColor: isSelected ? colors.accentRed : colors.surfaceCard,
                          borderColor: colors.border,
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <CategoryIcon
                        name={c.icon}
                        size={20}
                        color={isSelected ? '#FFFFFF' : colors.textPrimary}
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
                      backgroundColor: isSelected ? colors.surfaceLighter : colors.background,
                      borderColor: isSelected ? colors.accentRed : colors.border,
                      borderWidth: 1,
                      borderRadius: radius.md,
                      marginBottom: 8,
                    },
                  ]}
                >
                  <View>
                    <AppText
                      variant="cardTitle"
                      style={{
                        color: colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: 15,
                      }}
                    >
                      {acc.name}
                    </AppText>
                    <AppText
                      variant="metadata"
                      style={{
                        color: colors.textSecondary,
                      }}
                    >
                      {acc.type.toUpperCase()}
                    </AppText>
                  </View>
                  <AppText
                    variant="amountSmall"
                    style={{
                      color: isSelected ? colors.accentRed : colors.textPrimary,
                      fontWeight: '600',
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

      {/* Smart Expense Parser Modal */}
      <Modal
        visible={smartFillVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSmartFillVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.pickerSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: spacing.lg,
                maxHeight: '85%',
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CategoryIcon name="Zap" size={18} color={colors.accent} strokeWidth={2.4} />
                  <AppText variant="cardTitle" style={{ color: colors.textPrimary, marginLeft: 8 }}>
                    Smart Expense Auto-Fill
                  </AppText>
                </View>
                <TouchableOpacity onPress={() => setSmartFillVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <CategoryIcon name="X" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <AppText variant="metadata" style={{ color: colors.textSecondary, marginBottom: 10 }}>
                Paste receipt/transaction text or type e.g. "Dinner 420":
              </AppText>

              <TextInput
                value={smartInput}
                onChangeText={setSmartInput}
                placeholder="e.g. Coffee 250, Groceries 1200..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                style={[
                  styles.smartTextInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Quick Sample Chips */}
              <View style={{ marginTop: 10 }}>
                <AppText variant="labelSmall" style={{ color: colors.textSecondary, marginBottom: 6 }}>
                  OR TAP A SAMPLE:
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6 }}>
                  {[
                    'Groceries 1250 paid by UPI',
                    'Cab ride ₹280 paid by Card',
                    'Online shopping Rs. 1499',
                    'Coffee 250',
                    'Salary credited Rs 75000',
                  ].map(sample => (
                    <TouchableOpacity
                      key={sample}
                      onPress={() => setSmartInput(sample)}
                      style={[
                        styles.sampleChip,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <AppText variant="metadata" style={{ color: colors.textPrimary, fontSize: 11 }}>
                        {sample}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Live Parse Preview Card */}
              {parsedResult && parsedResult.success && (
                <View
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      marginTop: 14,
                      padding: 12,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                      DETECTED DETAILS
                    </AppText>
                    <View style={[styles.confidenceBadge, { backgroundColor: colors.accent }]}>
                      <AppText variant="labelSmall" style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 10 }}>
                        {parsedResult.type.toUpperCase()} • {parsedResult.confidence.toUpperCase()} CONFIDENCE
                      </AppText>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                    <AppText variant="displayMedium" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                      {currencySymbol}{parsedResult.amount}
                    </AppText>
                    <AppText variant="bodyMedium" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                      {parsedResult.merchant}
                    </AppText>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                      Category: <AppText variant="metadata" style={{ color: colors.textPrimary, fontWeight: '600' }}>{parsedResult.categoryName || 'General'}</AppText>
                    </AppText>
                    <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                      Account: <AppText variant="metadata" style={{ color: colors.textPrimary, fontWeight: '600' }}>{parsedResult.accountName || 'Primary'}</AppText>
                    </AppText>
                  </View>

                  <AppButton
                    title="APPLY TO TRANSACTION"
                    onPress={() => handleApplySmartFill()}
                    variant="primary"
                    size="medium"
                    style={{ marginTop: 12 }}
                  />
                </View>
              )}

              {!parsedResult?.success && smartInput.trim().length > 0 && (
                <View style={{ marginTop: 12, padding: 8, backgroundColor: colors.background, borderRadius: radius.sm }}>
                  <AppText variant="metadata" style={{ color: colors.coral, textAlign: 'center' }}>
                    Searching for amount in text... (e.g. include ₹350 or 450)
                  </AppText>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  receiptScanBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  amountContainer: {
    borderWidth: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  amountDisplayRow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  incrementRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  incrementChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
  receiptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  receiptThumb: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  receiptInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  smartFillBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  smartIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartTextInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  sampleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 4,
  },
  previewCard: {
    borderWidth: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
});
