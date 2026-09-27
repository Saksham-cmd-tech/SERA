import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { FinanceGrid } from '../../components/common/FinanceGrid';
import { AppButton } from '../../components/common/AppButton';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { SeraLogo } from '../../components/common/SeraLogo';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useBudgetStore } from '../../store/useBudgetStore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: '₹ INR' },
  { code: 'USD', symbol: '$', label: '$ USD' },
  { code: 'EUR', symbol: '€', label: '€ EUR' },
  { code: 'GBP', symbol: '£', label: '£ GBP' },
] as const;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  console.log('--- ONBOARDING SCREEN MOUNTED ---');
  const { colors, spacing, radius } = useAppTheme();
  const { completeOnboarding } = useSettingsStore();
  const { loadAccounts } = useAccountStore();
  const { loadBudgetSummary } = useBudgetStore();

  const [step, setStep] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountName, setAccountName] = useState('Primary Bank');
  const [monthlyBudget, setMonthlyBudget] = useState('');

  const currentCurrencySymbol = CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || '₹';

  const slides = [
    {
      badge: 'SERA • INTENTIONAL FINANCE',
      titleTop: 'TAKE INTENTIONAL',
      titleBottom: 'CONTROL OF MONEY',
      desc: 'Welcome to SERA (Spending & Expense Record App). Built with architectural clarity, muted editorial palettes, zero clutter, and 100% private offline storage.',
      featureIcon: 'SlidersHorizontal',
    },
    {
      badge: 'SPEED & ACCURACY',
      titleTop: 'RECORD & ATTACH',
      titleBottom: 'RECEIPTS IN SECONDS',
      desc: 'Add outflows in under 5 seconds with tactile numeric mechanics. Snap or attach receipt photos for warranties, expenses, and tax records.',
      featureIcon: 'Camera',
    },
    {
      badge: 'PROACTIVE ALERTS',
      titleTop: 'VISUAL OVERRUNS',
      titleBottom: '& SAVINGS GOALS',
      desc: 'Clear visual vertical rhythms and coral overrun warnings ensure you always know where your money goes before month-end.',
      featureIcon: 'ShieldAlert',
    },
  ];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const parsedBalance = parseFloat(initialBalance.replace(/,/g, '')) || 0;
      const parsedBudget = parseFloat(monthlyBudget.replace(/,/g, '')) || 0;

      await completeOnboarding(
        selectedCurrency,
        currentCurrencySymbol,
        userName.trim() || 'User',
        parsedBalance,
        accountName.trim() || 'Primary Bank',
        parsedBudget
      );

      // Refresh stores so user sees new configuration immediately
      await loadAccounts();
      await loadBudgetSummary();

      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkipToSetup = () => {
    setStep(3);
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Top Navigation Bar: Back & Skip */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.screenPadding }]}>
        {step > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.backBtn}
          >
            <CategoryIcon name="ChevronLeft" size={20} color={colors.textPrimary} />
            <AppText variant="labelSmall" style={{ color: colors.textPrimary, marginLeft: 4 }}>
              BACK
            </AppText>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}

        {/* Step indicator pills */}
        <View style={styles.stepPillContainer}>
          {[0, 1, 2, 3].map(idx => (
            <View
              key={idx}
              style={[
                styles.stepPill,
                {
                  backgroundColor:
                    step === idx
                      ? colors.cardDark
                      : step > idx
                      ? colors.textSecondary
                      : colors.border,
                  width: step === idx ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {step < 3 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkipToSetup}
            style={styles.skipBtn}
          >
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1 }}>
              SKIP
            </AppText>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step < 3 ? (
          // Walkthrough Slides
          <View style={styles.slideWrapper}>
            {/* Visual Header Illustration */}
            <View
              style={[
                styles.illustrationBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <View style={styles.illustrationBadgeRow}>
                <View
                  style={[
                    styles.featureIconWrap,
                    { backgroundColor: colors.cardDark },
                  ]}
                >
                  <CategoryIcon
                    name={slides[step].featureIcon}
                    size={22}
                    color={colors.textInverted}
                  />
                </View>
                <AppText
                  variant="labelSmall"
                  style={{ color: colors.textSecondary, letterSpacing: 2 }}
                >
                  {slides[step].badge}
                </AppText>
              </View>

              {step === 0 && (
                <View style={{ alignItems: 'center', width: '100%', paddingVertical: 4 }}>
                  <SeraLogo size={56} showText showTagline direction="column" />
                  <View style={[styles.gridContainer, { marginTop: 14 }]}>
                    <FinanceGrid
                      barsCount={28}
                      height={44}
                      minHeight={10}
                      pattern="reference"
                      lineWidth={1.5}
                      lineSpacing={5}
                      color={colors.gridLine}
                      activeColor={colors.cardDark}
                      progress={0.7}
                    />
                  </View>
                </View>
              )}

              {step === 1 && (
                <View style={styles.previewCard}>
                  <View style={styles.previewTxRow}>
                    <View style={styles.previewTxLeft}>
                      <CategoryIcon name="Camera" size={16} color={colors.positive} />
                      <AppText
                        variant="bodyMedium"
                        style={{ color: colors.textPrimary, marginLeft: 8, fontWeight: '600' }}
                      >
                        Apple Store Receipt
                      </AppText>
                    </View>
                    <AppText
                      variant="amountMedium"
                      style={{ color: colors.textPrimary, fontWeight: '700' }}
                    >
                      {currentCurrencySymbol}4,500
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.receiptTag,
                      { backgroundColor: colors.accent, borderColor: colors.border },
                    ]}
                  >
                    <CategoryIcon name="Check" size={12} color={colors.textPrimary} />
                    <AppText
                      variant="labelSmall"
                      style={{ color: colors.textPrimary, marginLeft: 4, fontSize: 10 }}
                    >
                      Photo Attached & Backed Up
                    </AppText>
                  </View>
                </View>
              )}

              {step === 2 && (
                <View
                  style={[
                    styles.overrunPreview,
                    { backgroundColor: colors.coral, borderRadius: radius.xs },
                  ]}
                >
                  <View style={styles.overrunTop}>
                    <CategoryIcon name="AlertTriangle" size={16} color="#FFFFFF" />
                    <AppText
                      variant="labelSmall"
                      style={{ color: '#FFFFFF', marginLeft: 6, letterSpacing: 1.5, fontWeight: '700' }}
                    >
                      BUDGET OVERRUN ALERT
                    </AppText>
                  </View>
                  <AppText
                    variant="displayLarge"
                    style={{ color: '#FFFFFF', fontSize: 28, marginTop: 6 }}
                  >
                    {currentCurrencySymbol}2,400 over limit
                  </AppText>
                </View>
              )}
            </View>

            {/* Slide Text */}
            <View style={{ marginTop: 28 }}>
              <AppText
                variant="displayLarge"
                style={{
                  color: colors.textPrimary,
                  letterSpacing: -0.5,
                  fontSize: 26,
                  lineHeight: 32,
                  fontFamily: 'Courier',
                }}
              >
                {slides[step].titleTop}
              </AppText>
              <AppText
                variant="displayLarge"
                style={{
                  color: colors.cardDark,
                  letterSpacing: -0.5,
                  fontSize: 26,
                  lineHeight: 32,
                  fontFamily: 'Courier',
                  fontWeight: '700',
                }}
              >
                {slides[step].titleBottom}
              </AppText>
              <AppText
                variant="bodyLarge"
                style={{
                  color: colors.textSecondary,
                  marginTop: 14,
                  lineHeight: 22,
                  fontSize: 14,
                }}
              >
                {slides[step].desc}
              </AppText>
            </View>

            {/* Next Action Button */}
            <View style={{ marginTop: 40, marginBottom: 20 }}>
              <AppButton
                title={step === 2 ? 'PERSONALIZE YOUR SETUP' : 'CONTINUE'}
                onPress={handleNext}
                variant="primary"
                size="large"
              />
            </View>
          </View>
        ) : (
          // Step 3: Personalized Setup
          <View style={styles.slideWrapper}>
            <View style={{ marginBottom: 16 }}>
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 2, marginBottom: 4 }}
              >
                STEP 4 OF 4 • PERSONAL SETUP
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                <SeraLogo size={32} style={{ marginRight: 10 }} />
                <AppText
                  variant="pageHeading"
                  style={{ color: colors.textPrimary, letterSpacing: -0.5 }}
                >
                  Welcome to SERA
                </AppText>
              </View>
              <AppText
                variant="bodyMedium"
                style={{ color: colors.textSecondary, marginTop: 4 }}
              >
                Spending & Expense Record App • Tailor your currency, opening balance, and monthly target.
              </AppText>
            </View>

            {/* Your Name */}
            <View
              style={[
                styles.setupCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 1.2 }}
              >
                YOUR NAME
              </AppText>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="e.g. John Doe"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderBottomColor: colors.border,
                  },
                ]}
              />
            </View>

            {/* Currency Choice */}
            <View
              style={[
                styles.setupCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 1.2, marginBottom: 10 }}
              >
                PRIMARY CURRENCY
              </AppText>
              <View style={styles.currencyRow}>
                {CURRENCIES.map(curr => {
                  const isSelected = selectedCurrency === curr.code;
                  return (
                    <TouchableOpacity
                      key={curr.code}
                      activeOpacity={0.7}
                      onPress={() => setSelectedCurrency(curr.code)}
                      style={[
                        styles.currChip,
                        {
                          backgroundColor: isSelected ? colors.cardDark : colors.background,
                          borderColor: isSelected ? colors.cardDark : colors.border,
                          borderRadius: radius.xs,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelSmall"
                        style={{
                          color: isSelected ? colors.textInverted : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {curr.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Primary Account Name & Starting Balance */}
            <View
              style={[
                styles.setupCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 1.2 }}
              >
                PRIMARY ACCOUNT NAME
              </AppText>
              <TextInput
                value={accountName}
                onChangeText={setAccountName}
                placeholder="e.g. HDFC Bank, Checking, Cash"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderBottomColor: colors.border,
                    marginBottom: 14,
                  },
                ]}
              />

              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 1.2 }}
              >
                STARTING BALANCE ({currentCurrencySymbol})
              </AppText>
              <TextInput
                value={initialBalance}
                onChangeText={setInitialBalance}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderBottomColor: colors.border,
                  },
                ]}
              />
            </View>

            {/* Monthly Budget Target */}
            <View
              style={[
                styles.setupCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 1.2 }}
              >
                MONTHLY BUDGET CEILING ({currentCurrencySymbol})
              </AppText>
              <TextInput
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
                placeholder="Optional (e.g. 40,000)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderBottomColor: colors.border,
                  },
                ]}
              />
            </View>

            {/* Finish Button */}
            <View style={{ marginTop: 10, marginBottom: 30 }}>
              <AppButton
                title="START TRACKING"
                onPress={handleNext}
                variant="accent"
                size="large"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  skipBtn: {
    alignItems: 'flex-end',
    width: 60,
  },
  stepPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepPill: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  scrollContent: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  slideWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  illustrationBox: {
    borderWidth: 1,
    padding: 20,
    minHeight: 180,
    justifyContent: 'center',
  },
  illustrationBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  previewCard: {
    padding: 14,
  },
  previewTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewTxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  overrunPreview: {
    padding: 16,
  },
  overrunTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setupCard: {
    borderWidth: 1,
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginTop: 4,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 3,
  },
});
