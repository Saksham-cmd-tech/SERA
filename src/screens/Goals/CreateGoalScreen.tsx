import React, { useState, useRef } from 'react';
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
import { useGoalStore } from '../../store/useGoalStore';
import { useAccountStore } from '../../store/useAccountStore';

interface CreateGoalScreenProps {
  navigation: any;
}

export const CreateGoalScreen: React.FC<CreateGoalScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol } = useAppTheme();
  const { createGoal } = useGoalStore();
  const accounts = useAccountStore(state => state.accounts);

  const scrollRef = useRef<any>(null);
  const keyboardPadding = useKeyboardBottomInset(30);

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [monthlyContributionStr, setMonthlyContributionStr] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Laptop');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  React.useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const iconsList = ['Laptop', 'Plane', 'Shield', 'Home', 'Car', 'Heart', 'GraduationCap', 'Wallet'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a goal name.');
      return;
    }
    const target = parseFloat(targetAmountStr);
    if (!target || target <= 0) {
      Alert.alert('Invalid Target', 'Please enter a target amount greater than 0.');
      return;
    }

    const current = parseFloat(currentAmountStr) || 0;
    const monthly = parseFloat(monthlyContributionStr) || Math.round(target / 12);
    const accountId = selectedAccountId || accounts[0]?.id;

    if (!accountId) {
      Alert.alert('No Account', 'Please create an account before creating a savings goal.');
      return;
    }

    await createGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate,
      monthlyContribution: monthly,
      accountId,
      icon: selectedIcon,
      color: '#E4CF55',
    });

    Alert.alert('Goal Created', `Savings goal "${name}" has been created.`);
    navigation.goBack();
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header showBack onPressBack={() => navigation.goBack()} subtitle="Savings" title="Create Goal" />

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
        {/* Apple HIG Section Title */}
        <View style={{ marginBottom: spacing.md }}>
          <AppText variant="pageHeading" style={{ color: colors.textPrimary }}>
            Set a Target
          </AppText>
          <AppText variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Define how much and when you plan to save.
          </AppText>
        </View>

        {/* Target Amount Box */}
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
            TARGET AMOUNT
          </AppText>
          <View style={styles.inputPrefixRow}>
            <AppText variant="displayLarge" style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {currencySymbol}
            </AppText>
            <TextInput
              value={targetAmountStr}
              onChangeText={setTargetAmountStr}
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

        {/* Form Fields Card */}
        <View
          style={[
            styles.card,
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
          {/* Goal Name */}
          <View style={styles.fieldRow}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 100, fontWeight: '500' }}>
              Goal Name
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. MacBook Pro, Vacation"
              placeholderTextColor={colors.textMuted}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 150, animated: true });
                }, 150);
              }}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>

          {/* Initial Balance */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 100, fontWeight: '500' }}>
              Saved So Far
            </AppText>
            <TextInput
              value={currentAmountStr}
              onChangeText={setCurrentAmountStr}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 220, animated: true });
                }, 150);
              }}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>

          {/* Target Date */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 100, fontWeight: '500' }}>
              Target Date
            </AppText>
            <TextInput
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 280, animated: true });
                }, 150);
              }}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>

          {/* Monthly Contribution */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <AppText variant="bodyMedium" style={{ color: colors.textSecondary, width: 100, fontWeight: '500' }}>
              Monthly Pace
            </AppText>
            <TextInput
              value={monthlyContributionStr}
              onChangeText={setMonthlyContributionStr}
              placeholder={targetAmountStr ? String(Math.round(parseFloat(targetAmountStr) / 12 || 0)) : 'e.g. 5000'}
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 340, animated: true });
                }, 150);
              }}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Icon Selection */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 10, marginTop: 4 }}>
          CHOOSE ICON
        </AppText>
        <View style={styles.iconRow}>
          {iconsList.map(ic => {
            const isSelected = selectedIcon === ic;
            return (
              <TouchableOpacity
                key={ic}
                activeOpacity={0.7}
                onPress={() => setSelectedIcon(ic)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: isSelected ? colors.accentRed : colors.surfaceCard,
                    borderRadius: radius.md,
                    borderColor: colors.borderLight,
                    borderWidth: isSelected ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <CategoryIcon
                  name={ic}
                  size={20}
                  color={isSelected ? '#FFFFFF' : colors.textPrimary}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Linked Account Selection */}
        <AppText variant="sectionHeading" style={{ color: colors.textSecondary, marginBottom: 10, marginTop: 4 }}>
          LINKED ACCOUNT
        </AppText>
        <View style={styles.iconRow}>
          {accounts.map(acc => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <TouchableOpacity
                key={acc.id}
                activeOpacity={0.7}
                onPress={() => setSelectedAccountId(acc.id)}
                style={[
                  styles.accountSelectChip,
                  {
                    backgroundColor: isSelected ? colors.accentRed : colors.surfaceCard,
                    borderRadius: radius.full,
                    borderColor: colors.borderLight,
                    borderWidth: isSelected ? 0 : StyleSheet.hairlineWidth,
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
        </View>

        {/* Save Button */}
        <AppButton
          title="Create Savings Goal"
          onPress={handleSave}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.lg, marginBottom: 30 }}
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
  inputPrefixRow: {
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  iconOption: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  accountSelectChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
});
