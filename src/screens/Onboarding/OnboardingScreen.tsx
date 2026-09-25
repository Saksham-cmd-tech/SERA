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
import { useSettingsStore } from '../../store/useSettingsStore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors, spacing, radius, currencySymbol } = useAppTheme();
  const { completeOnboarding } = useSettingsStore();

  const [step, setStep] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [initialBalance, setInitialBalance] = useState('85000');
  const [accountName, setAccountName] = useState('Primary Bank');
  const [monthlyBudget, setMonthlyBudget] = useState('45000');

  const slides = [
    {
      titleTop: 'TAKE CONTROL',
      titleBottom: 'OF YOUR MONEY',
      desc: 'Architectural clarity, intentional design, and deep personal finance control.',
    },
    {
      titleTop: 'TRACK EVERY',
      titleBottom: 'EXPENSE INSTANTLY',
      desc: 'Record outflows in under 5 seconds with custom numeric keypad mechanics.',
    },
    {
      titleTop: 'BUILD BETTER',
      titleBottom: 'FINANCIAL HABITS',
      desc: 'Visual budget rhythm, automated category overruns, and disciplined savings targets.',
    },
  ];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const symbol = selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : '€';
      await completeOnboarding(
        selectedCurrency,
        symbol,
        parseFloat(initialBalance) || 0,
        accountName,
        parseFloat(monthlyBudget) || 45000
      );
      onComplete();
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View style={styles.stepsRow}>
          {[0, 1, 2, 3].map(idx => (
            <View
              key={idx}
              style={[
                styles.stepDash,
                {
                  backgroundColor: step >= idx ? colors.cardDark : colors.border,
                },
              ]}
            />
          ))}
        </View>

        {step < 3 ? (
          // Walkthrough Screens 1-3
          <View style={styles.slideWrapper}>
            <View style={{ marginVertical: 30, alignItems: 'center' }}>
              <FinanceGrid
                barsCount={28}
                height={80}
                minHeight={20}
                pattern="reference"
                lineWidth={1.5}
                lineSpacing={4}
                color={colors.gridLine}
                activeColor={colors.textPrimary}
                progress={0.7}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <AppText
                variant="pageHeading"
                style={{ color: colors.textPrimary, letterSpacing: -0.5, lineHeight: 42 }}
              >
                {slides[step].titleTop}
              </AppText>
              <AppText
                variant="pageHeading"
                style={{ color: colors.cardDark, letterSpacing: -0.5, lineHeight: 42 }}
              >
                {slides[step].titleBottom}
              </AppText>
              <AppText
                variant="bodyLarge"
                style={{ color: colors.textSecondary, marginTop: 14, lineHeight: 24 }}
              >
                {slides[step].desc}
              </AppText>
            </View>

            <View style={{ marginTop: 60 }}>
              <AppButton
                title={step === 2 ? 'SET UP FINANCES' : 'CONTINUE'}
                onPress={handleNext}
                variant="primary"
                size="large"
              />
            </View>
          </View>
        ) : (
          // Setup Screen (Screen 4)
          <View style={styles.slideWrapper}>
            <AppText
              variant="label"
              style={{ color: colors.textSecondary, letterSpacing: 2, marginBottom: 4 }}
            >
              INITIAL SETUP
            </AppText>
            <AppText variant="pageHeading" style={{ color: colors.textPrimary, marginBottom: 20 }}>
              Set Up Your Finances
            </AppText>

            {/* Currency Choice */}
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, marginBottom: 6 }}>
              DEFAULT CURRENCY
            </AppText>
            <View style={styles.currencyRow}>
              {(['INR', 'USD', 'EUR'] as const).map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedCurrency(c)}
                  style={[
                    styles.currChip,
                    {
                      backgroundColor: selectedCurrency === c ? colors.cardDark : colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.xs,
                    },
                  ]}
                >
                  <AppText
                    variant="label"
                    style={{
                      color: selectedCurrency === c ? colors.textInverted : colors.textPrimary,
                    }}
                  >
                    {c === 'INR' ? '₹ INR' : c === 'USD' ? '$ USD' : '€ EUR'}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Starting Balance */}
            <View
              style={[
                styles.setupBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  marginTop: 14,
                },
              ]}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                PRIMARY ACCOUNT NAME
              </AppText>
              <TextInput
                value={accountName}
                onChangeText={setAccountName}
                placeholder="HDFC Bank"
                placeholderTextColor={colors.textMuted}
                style={[styles.setupInput, { color: colors.textPrimary }]}
              />
            </View>

            <View
              style={[
                styles.setupBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  marginTop: 10,
                },
              ]}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                STARTING BALANCE ({currencySymbol})
              </AppText>
              <TextInput
                value={initialBalance}
                onChangeText={setInitialBalance}
                placeholder="85000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.setupInput, { color: colors.textPrimary }]}
              />
            </View>

            <View
              style={[
                styles.setupBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  marginTop: 10,
                },
              ]}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
                MONTHLY BUDGET TARGET ({currencySymbol})
              </AppText>
              <TextInput
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
                placeholder="45000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.setupInput, { color: colors.textPrimary }]}
              />
            </View>

            <View style={{ marginTop: 30, marginBottom: 30 }}>
              <AppButton
                title="LAUNCH APP"
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
  scrollContent: {
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepDash: {
    flex: 1,
    height: 3,
    marginHorizontal: 3,
    borderRadius: 1,
  },
  slideWrapper: {
    flex: 1,
    justifyContent: 'center',
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
  setupBox: {
    padding: 12,
    borderWidth: 1,
  },
  setupInput: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    paddingVertical: 0,
  },
});
