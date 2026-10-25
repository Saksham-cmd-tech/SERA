import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ArrowRight,
  Lock,
  Shield,
  TrendingUp,
  Coffee,
  Camera,
  Check,
  Zap,
  Sparkles,
  Repeat,
  Wallet,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useKeyboardBottomInset } from '../../hooks/useKeyboardBottomInset';
import { AppText } from '../../components/common/AppText';
import { SeraLogo } from '../../components/common/SeraLogo';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { fonts } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: '₹ INR' },
  { code: 'USD', symbol: '$', label: '$ USD' },
  { code: 'EUR', symbol: '€', label: '€ EUR' },
  { code: 'GBP', symbol: '£', label: '£ GBP' },
] as const;

type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors, spacing, radius, isDark } = useAppTheme();
  const { completeOnboarding } = useSettingsStore();
  const { loadAccounts } = useAccountStore();
  const { loadBudgetSummary } = useBudgetStore();

  const scrollRef = useRef<any>(null);
  const keyboardPadding = useKeyboardBottomInset(24);

  const [step, setStep] = useState<number>(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Form State
  const [userName, setUserName] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  const [accountName, setAccountName] = useState<string>('Primary Bank');
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');

  const currentCurrencySymbol =
    CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || '₹';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const dotWidths = useRef([
    new Animated.Value(24),
    new Animated.Value(8),
    new Animated.Value(8),
    new Animated.Value(8),
  ]).current;

  // Animate slide change
  const triggerTransition = (nextStep: number, navDirection: 'forward' | 'backward') => {
    const exitTranslation = navDirection === 'forward' ? -18 : 18;
    const enterTranslation = navDirection === 'forward' ? 18 : -18;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: exitTranslation,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(enterTranslation);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Animate pagination dots
    dotWidths.forEach((anim, idx) => {
      Animated.spring(anim, {
        toValue: idx === nextStep ? 24 : 8,
        useNativeDriver: false,
        friction: 8,
        tension: 80,
      }).start();
    });
  };

  const handleNext = async () => {
    if (step < 3) {
      setDirection('forward');
      triggerTransition(step + 1, 'forward');
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
      try {
        const { useTransactionStore } = require('../../store/useTransactionStore');
        await useTransactionStore.getState().loadTransactions();
        const { widgetService } = require('../../services/widgetService');
        widgetService.syncWidgets({
          currencySymbol: currentCurrencySymbol,
          accounts: useAccountStore.getState().accounts,
          transactions: [],
          budgetSummary: useBudgetStore.getState().summary,
          goals: [],
          subscriptions: [],
          subMonthlyTotal: 0,
        });
      } catch (e) {
        console.warn('Post-onboarding store refresh error:', e);
      }

      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection('backward');
      triggerTransition(step - 1, 'backward');
    }
  };

  const handleSkip = () => {
    setDirection('forward');
    triggerTransition(3, 'forward');
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Apple-Style Minimal Navigation Bar */}
      <View style={styles.navBar}>
        {step > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.navButtonLeft}
          >
            <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.4} />
            <AppText
              variant="bodyLarge"
              style={[
                styles.navBackText,
                { color: colors.textPrimary, fontFamily: fonts.inter.medium },
              ]}
            >
              Back
            </AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}

        {step < 3 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.navButtonRight}
          >
            <AppText
              variant="bodyLarge"
              style={{
                color: colors.textSecondary,
                fontFamily: fonts.inter.medium,
                fontSize: 15,
              }}
            >
              Skip
            </AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}
      </View>

      {/* Main Content Area */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(keyboardPadding + 110, 120),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.animatedSlide,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {step === 0 && (
            <WelcomeSlide
              colors={colors}
              currentCurrencySymbol={currentCurrencySymbol}
              isDark={isDark}
            />
          )}

          {step === 1 && (
            <SpeedSlide
              colors={colors}
              currentCurrencySymbol={currentCurrencySymbol}
              isDark={isDark}
            />
          )}

          {step === 2 && (
            <BudgetSlide
              colors={colors}
              currentCurrencySymbol={currentCurrencySymbol}
              isDark={isDark}
            />
          )}

          {step === 3 && (
            <SetupSlide
              colors={colors}
              isDark={isDark}
              currentCurrencySymbol={currentCurrencySymbol}
              userName={userName}
              setUserName={setUserName}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              accountName={accountName}
              setAccountName={setAccountName}
              initialBalance={initialBalance}
              setInitialBalance={setInitialBalance}
              monthlyBudget={monthlyBudget}
              setMonthlyBudget={setMonthlyBudget}
              onFocusField={(yOffset: number) => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: yOffset, animated: true });
                }, 100);
              }}
            />
          )}
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Bar (Apple Paging & Action Button) */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {[0, 1, 2, 3].map(idx => (
            <Animated.View
              key={idx}
              style={[
                styles.dot,
                {
                  width: dotWidths[idx],
                  backgroundColor:
                    step === idx
                      ? colors.accentRed
                      : isDark
                      ? 'rgba(255, 255, 255, 0.22)'
                      : 'rgba(0, 0, 0, 0.16)',
                },
              ]}
            />
          ))}
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.accentRed,
              shadowColor: colors.accentRed,
            },
          ]}
        >
          <AppText
            variant="bodyLarge"
            style={[
              styles.primaryButtonText,
              { fontFamily: fonts.inter.bold },
            ]}
          >
            {step === 3 ? 'Get Started' : 'Continue'}
          </AppText>
          {step < 3 && (
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} style={{ marginLeft: 6 }} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* -------------------------------------------------------------------------- */
/* SLIDE 0: Welcome / Identity                                                */
/* -------------------------------------------------------------------------- */
const WelcomeSlide: React.FC<{
  colors: any;
  currentCurrencySymbol: string;
  isDark: boolean;
}> = ({ colors, currentCurrencySymbol, isDark }) => {
  return (
    <View style={styles.slideContainer}>
      {/* Hero Visual */}
      <View style={styles.heroVisualArea}>
        {/* Soft Ambient Radial Halo */}
        <View
          style={[
            styles.ambientGlow,
            {
              backgroundColor: isDark
                ? 'rgba(235, 59, 46, 0.14)'
                : 'rgba(235, 59, 46, 0.08)',
            },
          ]}
        />

        {/* Squircle App Emblem */}
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          <SeraLogo size={68} direction="column" />
        </View>

        {/* Symmetrical Floating Security Pills */}
        <View style={styles.pillBadgeRow}>
          <View
            style={[
              styles.pillBadge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Lock size={12} color={colors.positive} strokeWidth={2.2} />
            <AppText
              variant="labelSmall"
              style={[styles.pillBadgeText, { color: colors.textPrimary }]}
            >
              100% Offline
            </AppText>
          </View>

          <View
            style={[
              styles.pillBadge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Shield size={12} color={colors.accentRed} strokeWidth={2.2} />
            <AppText
              variant="labelSmall"
              style={[styles.pillBadgeText, { color: colors.textPrimary }]}
            >
              Private by Design
            </AppText>
          </View>
        </View>

        {/* Floating Apple-Style Net Worth Card */}
        <View
          style={[
            styles.netWorthCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.netWorthHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.smallIconCircle,
                  { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
                ]}
              >
                <TrendingUp size={13} color={colors.positive} strokeWidth={2.4} />
              </View>
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, marginLeft: 8, letterSpacing: 1 }}
              >
                NET WORTH
              </AppText>
            </View>
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: 'rgba(52, 211, 153, 0.12)' },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{ color: colors.positive, fontWeight: '700', fontSize: 10 }}
              >
                +8.4%
              </AppText>
            </View>
          </View>
          <AppText
            variant="amountLarge"
            style={{
              color: colors.textPrimary,
              marginTop: 6,
              fontSize: 24,
              fontFamily: fonts.mono.bold,
            }}
          >
            {currentCurrencySymbol}1,24,500
          </AppText>
        </View>
      </View>

      {/* Copy Section */}
      <View style={styles.copyArea}>
        <AppText
          variant="labelSmall"
          style={[
            styles.preTitle,
            { color: colors.accentRed, letterSpacing: 1.8 },
          ]}
        >
          WELCOME TO SERA
        </AppText>

        <AppText
          variant="pageHeading"
          style={[
            styles.headline,
            { color: colors.textPrimary, fontFamily: fonts.inter.bold },
          ]}
        >
          Intentional finance,{"\n"}built for clarity.
        </AppText>

        <AppText
          variant="bodyLarge"
          style={[
            styles.description,
            { color: colors.textSecondary, fontFamily: fonts.inter.regular },
          ]}
        >
          A private, distraction-free space to record spending, understand cash flow, and build lasting financial discipline.
        </AppText>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* SLIDE 1: Tactile Speed & Receipts                                          */
/* -------------------------------------------------------------------------- */
const SpeedSlide: React.FC<{
  colors: any;
  currentCurrencySymbol: string;
  isDark: boolean;
}> = ({ colors, currentCurrencySymbol }) => {
  return (
    <View style={styles.slideContainer}>
      {/* Hero Visual: Apple Pay / Wallet Style Card */}
      <View style={styles.heroVisualArea}>
        <View
          style={[
            styles.walletCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Card Top: Merchant & Amount */}
          <View style={styles.walletCardTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.merchantAvatar,
                  { backgroundColor: 'rgba(245, 158, 11, 0.16)' },
                ]}
              >
                <Coffee size={20} color="#F59E0B" strokeWidth={2.2} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <AppText
                  variant="bodyLarge"
                  style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16 }}
                >
                  Blue Tokai Coffee
                </AppText>
                <AppText
                  variant="metadata"
                  style={{ color: colors.textSecondary, marginTop: 2 }}
                >
                  Dining & Cafes • Just now
                </AppText>
              </View>
            </View>

            <AppText
              variant="amountMedium"
              style={{
                color: colors.textPrimary,
                fontFamily: fonts.mono.bold,
                fontSize: 18,
              }}
            >
              -{currentCurrencySymbol}340
            </AppText>
          </View>

          {/* Card Divider */}
          <View
            style={[styles.cardDivider, { backgroundColor: colors.borderLight }]}
          />

          {/* Card Bottom: Receipt Attached & Speed Pill */}
          <View style={styles.walletCardBottom}>
            <View
              style={[
                styles.receiptBadge,
                {
                  backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  borderColor: 'rgba(52, 211, 153, 0.3)',
                },
              ]}
            >
              <Camera size={12} color={colors.positive} strokeWidth={2.2} />
              <AppText
                variant="labelSmall"
                style={{
                  color: colors.positive,
                  marginLeft: 5,
                  fontWeight: '700',
                  fontSize: 10,
                }}
              >
                Receipt Attached
              </AppText>
              <Check size={11} color={colors.positive} strokeWidth={2.6} style={{ marginLeft: 3 }} />
            </View>

            <View
              style={[
                styles.speedBadge,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Zap size={11} color={colors.accentRed} strokeWidth={2.4} />
              <AppText
                variant="labelSmall"
                style={{
                  color: colors.textSecondary,
                  marginLeft: 4,
                  fontWeight: '700',
                  fontSize: 10,
                }}
              >
                Logged in 2.8s
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Copy Section */}
      <View style={styles.copyArea}>
        <AppText
          variant="labelSmall"
          style={[
            styles.preTitle,
            { color: colors.accentRed, letterSpacing: 1.8 },
          ]}
        >
          FRICTIONLESS LOGGING
        </AppText>

        <AppText
          variant="pageHeading"
          style={[
            styles.headline,
            { color: colors.textPrimary, fontFamily: fonts.inter.bold },
          ]}
        >
          Capture expenses in{"\n"}under three seconds.
        </AppText>

        <AppText
          variant="bodyLarge"
          style={[
            styles.description,
            { color: colors.textSecondary, fontFamily: fonts.inter.regular },
          ]}
        >
          Add daily outflows with tactile numeric mechanics, smart category tagging, and camera receipt snapshots for warranties and taxes.
        </AppText>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* SLIDE 2: Proactive Budget Guards & Radar                                   */
/* -------------------------------------------------------------------------- */
const BudgetSlide: React.FC<{
  colors: any;
  currentCurrencySymbol: string;
  isDark: boolean;
}> = ({ colors, currentCurrencySymbol }) => {
  return (
    <View style={styles.slideContainer}>
      {/* Hero Visual: Apple Health Style Progress & Radar Card */}
      <View style={styles.heroVisualArea}>
        <View
          style={[
            styles.budgetCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Top Row: Budget Allocation */}
          <View style={styles.budgetCardTop}>
            <View>
              <AppText
                variant="labelSmall"
                style={{ color: colors.textSecondary, letterSpacing: 1 }}
              >
                OCTOBER BUDGET
              </AppText>
              <AppText
                variant="amountMedium"
                style={{
                  color: colors.textPrimary,
                  marginTop: 2,
                  fontFamily: fonts.mono.bold,
                  fontSize: 19,
                }}
              >
                {currentCurrencySymbol}28,500{' '}
                <AppText
                  variant="metadata"
                  style={{ color: colors.textSecondary, fontSize: 13 }}
                >
                  / {currentCurrencySymbol}45,000
                </AppText>
              </AppText>
            </View>

            <View
              style={[
                styles.percentPill,
                {
                  backgroundColor: 'rgba(235, 59, 46, 0.14)',
                  borderColor: 'rgba(235, 59, 46, 0.28)',
                },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{ color: colors.accentRed, fontWeight: '800', fontSize: 11 }}
              >
                63% USED
              </AppText>
            </View>
          </View>

          {/* Continuous Rounded Progress Track */}
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colors.surface },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: '63%',
                  backgroundColor: colors.accentRed,
                },
              ]}
            />
          </View>

          {/* Upcoming Subscription Radar Row */}
          <View
            style={[
              styles.subscriptionRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.subIconSquare,
                  { backgroundColor: 'rgba(235, 59, 46, 0.12)' },
                ]}
              >
                <Repeat size={14} color={colors.accentRed} strokeWidth={2.4} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <AppText
                  variant="bodyMedium"
                  style={{ color: colors.textPrimary, fontWeight: '700' }}
                >
                  Netflix Standard
                </AppText>
                <AppText
                  variant="metadata"
                  style={{ color: colors.textSecondary }}
                >
                  Tomorrow • {currentCurrencySymbol}649/mo
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.dueSoonBadge,
                {
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  borderColor: 'rgba(245, 158, 11, 0.25)',
                },
              ]}
            >
              <AppText
                variant="labelSmall"
                style={{ color: '#F59E0B', fontWeight: '700', fontSize: 9 }}
              >
                DUE SOON
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Copy Section */}
      <View style={styles.copyArea}>
        <AppText
          variant="labelSmall"
          style={[
            styles.preTitle,
            { color: colors.accentRed, letterSpacing: 1.8 },
          ]}
        >
          PROACTIVE RADAR
        </AppText>

        <AppText
          variant="pageHeading"
          style={[
            styles.headline,
            { color: colors.textPrimary, fontFamily: fonts.inter.bold },
          ]}
        >
          Know where you stand{"\n"}before month-end.
        </AppText>

        <AppText
          variant="bodyLarge"
          style={[
            styles.description,
            { color: colors.textSecondary, fontFamily: fonts.inter.regular },
          ]}
        >
          Visual overrun alerts protect you from unexpected category creep, with instant home screen widgets that keep your numbers in clear sight.
        </AppText>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* SLIDE 3: Apple Grouped Inset Personal Setup                                */
/* -------------------------------------------------------------------------- */
interface SetupSlideProps {
  colors: any;
  isDark: boolean;
  currentCurrencySymbol: string;
  userName: string;
  setUserName: (val: string) => void;
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (curr: CurrencyCode) => void;
  accountName: string;
  setAccountName: (val: string) => void;
  initialBalance: string;
  setInitialBalance: (val: string) => void;
  monthlyBudget: string;
  setMonthlyBudget: (val: string) => void;
  onFocusField: (yOffset: number) => void;
}

const SetupSlide: React.FC<SetupSlideProps> = ({
  colors,
  isDark,
  currentCurrencySymbol,
  userName,
  setUserName,
  selectedCurrency,
  setSelectedCurrency,
  accountName,
  setAccountName,
  initialBalance,
  setInitialBalance,
  monthlyBudget,
  setMonthlyBudget,
  onFocusField,
}) => {
  return (
    <View style={styles.setupContainer}>
      {/* Setup Screen Header */}
      <View style={styles.setupHeaderArea}>
        <View
          style={[
            styles.setupIconBox,
            {
              backgroundColor: 'rgba(235, 59, 46, 0.12)',
              borderColor: 'rgba(235, 59, 46, 0.25)',
            },
          ]}
        >
          <Sparkles size={24} color={colors.accentRed} strokeWidth={2.2} />
        </View>

        <AppText
          variant="pageHeading"
          style={[
            styles.setupHeadline,
            { color: colors.textPrimary, fontFamily: fonts.inter.bold },
          ]}
        >
          Make SERA yours.
        </AppText>

        <AppText
          variant="bodyMedium"
          style={[
            styles.setupSubtext,
            { color: colors.textSecondary, fontFamily: fonts.inter.regular },
          ]}
        >
          Tailor your currency and opening account to begin tracking.
        </AppText>
      </View>

      {/* Apple Inset Grouped Table Section */}
      <View
        style={[
          styles.groupedCard,
          {
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Row 1: Your Name */}
        <View style={styles.tableRow}>
          <AppText
            variant="bodyMedium"
            style={[styles.rowLabel, { color: colors.textPrimary }]}
          >
            Name
          </AppText>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            style={[styles.rowInput, { color: colors.textPrimary }]}
            onFocus={() => onFocusField(0)}
          />
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        {/* Row 2: Currency Segmented Control */}
        <View style={styles.tableRowVertical}>
          <AppText
            variant="bodyMedium"
            style={[styles.rowLabel, { color: colors.textPrimary, marginBottom: 8 }]}
          >
            Currency
          </AppText>
          <View
            style={[
              styles.segmentedContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
            ]}
          >
            {CURRENCIES.map(curr => {
              const isSelected = selectedCurrency === curr.code;
              return (
                <TouchableOpacity
                  key={curr.code}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCurrency(curr.code)}
                  style={[
                    styles.segmentTab,
                    isSelected && [
                      styles.segmentTabActive,
                      {
                        backgroundColor: isDark ? '#1C2634' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        shadowColor: '#000000',
                      },
                    ],
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    style={[
                      styles.segmentText,
                      {
                        color: isSelected ? colors.textPrimary : colors.textSecondary,
                        fontFamily: isSelected ? fonts.inter.bold : fonts.inter.medium,
                      },
                    ]}
                  >
                    {curr.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        {/* Row 3: Account Name */}
        <View style={styles.tableRow}>
          <AppText
            variant="bodyMedium"
            style={[styles.rowLabel, { color: colors.textPrimary }]}
          >
            Account
          </AppText>
          <TextInput
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Primary Bank"
            placeholderTextColor={colors.textMuted}
            style={[styles.rowInput, { color: colors.textPrimary }]}
            onFocus={() => onFocusField(120)}
          />
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        {/* Row 4: Starting Balance */}
        <View style={styles.tableRow}>
          <AppText
            variant="bodyMedium"
            style={[styles.rowLabel, { color: colors.textPrimary }]}
          >
            Opening Balance
          </AppText>
          <View style={styles.numericInputWrap}>
            <AppText
              variant="bodyLarge"
              style={{
                color: colors.textSecondary,
                fontFamily: fonts.mono.bold,
                marginRight: 4,
              }}
            >
              {currentCurrencySymbol}
            </AppText>
            <TextInput
              value={initialBalance}
              onChangeText={setInitialBalance}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[
                styles.rowInputNumeric,
                { color: colors.textPrimary, fontFamily: fonts.mono.bold },
              ]}
              onFocus={() => onFocusField(220)}
            />
          </View>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        {/* Row 5: Monthly Budget Ceiling */}
        <View style={styles.tableRow}>
          <AppText
            variant="bodyMedium"
            style={[styles.rowLabel, { color: colors.textPrimary }]}
          >
            Monthly Target
          </AppText>
          <View style={styles.numericInputWrap}>
            <AppText
              variant="bodyLarge"
              style={{
                color: colors.textSecondary,
                fontFamily: fonts.mono.bold,
                marginRight: 4,
              }}
            >
              {currentCurrencySymbol}
            </AppText>
            <TextInput
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[
                styles.rowInputNumeric,
                { color: colors.textPrimary, fontFamily: fonts.mono.bold },
              ]}
              onFocus={() => onFocusField(320)}
            />
          </View>
        </View>
      </View>

      {/* Reassurance Footer */}
      <View style={styles.privacyReassurance}>
        <Lock size={13} color={colors.textSecondary} strokeWidth={2.2} />
        <AppText
          variant="bodyMedium"
          style={[
            styles.privacyText,
            { color: colors.textSecondary, fontFamily: fonts.inter.regular },
          ]}
        >
          All data remains strictly on your device. Never shared.
        </AppText>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  navButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
  },
  navBackText: {
    fontSize: 15,
    marginLeft: 2,
  },
  navButtonRight: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  navButtonPlaceholder: {
    minWidth: 70,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  animatedSlide: {
    width: '100%',
  },
  slideContainer: {
    width: '100%',
    alignItems: 'center',
  },

  /* Hero Visual Area */
  heroVisualArea: {
    width: '100%',
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  ambientGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  pillBadgeRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  netWorthCard: {
    width: '88%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  netWorthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },

  /* Slide 1: Wallet Card */
  walletCard: {
    width: '92%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  walletCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    marginVertical: 14,
  },
  walletCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },

  /* Slide 2: Budget Card */
  budgetCard: {
    width: '92%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  budgetCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  percentPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    marginVertical: 14,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  subIconSquare: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueSoonBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },

  /* Copy Section */
  copyArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 8,
  },
  preTitle: {
    fontWeight: '800',
    fontSize: 11,
    marginBottom: 6,
    textAlign: 'center',
  },
  headline: {
    fontSize: 27,
    lineHeight: 33,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 320,
  },

  /* Slide 3: Personal Setup */
  setupContainer: {
    width: '100%',
  },
  setupHeaderArea: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  setupIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  setupHeadline: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  setupSubtext: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 290,
  },
  groupedCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  tableRowVertical: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
    marginLeft: 16,
  },
  rowDivider: {
    height: 1,
    marginLeft: 16,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 3,
    borderWidth: 1,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  segmentTabActive: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    fontSize: 11,
  },
  numericInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  rowInputNumeric: {
    fontSize: 17,
    textAlign: 'right',
    paddingVertical: 0,
    minWidth: 80,
  },
  privacyReassurance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 12,
    marginLeft: 6,
  },

  /* Bottom Sticky Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    borderTopWidth: 1,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3.5,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
