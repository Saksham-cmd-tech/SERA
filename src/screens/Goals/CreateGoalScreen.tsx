import React, { useState } from 'react';
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
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header showBack onPressBack={() => navigation.goBack()} subtitle="SAVINGS" title="Create Goal" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Question Banner from Reference */}
        <View style={{ marginBottom: spacing.md }}>
          <AppText variant="pageSubheading" style={{ color: colors.textSecondary }}>
            How much do
          </AppText>
          <AppText variant="pageHeading" style={{ color: colors.textPrimary, textTransform: 'uppercase' }}>
            You want to save?
          </AppText>
        </View>

        {/* Target Amount Box */}
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
          <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
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
              style={[styles.largeInput, { color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Form Fields Card */}
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
          {/* Goal Name */}
          <View style={styles.fieldRow}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 90 }}>
              GOAL NAME
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. MacBook Pro, Trip"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>

          {/* Initial Balance */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 90 }}>
              SAVED SO FAR
            </AppText>
            <TextInput
              value={currentAmountStr}
              onChangeText={setCurrentAmountStr}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>

          {/* Target Date */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 90 }}>
              TARGET DATE
            </AppText>
            <TextInput
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>

          {/* Monthly Contribution */}
          <View style={[styles.fieldRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, width: 90 }}>
              MONTHLY TARGET
            </AppText>
            <TextInput
              value={monthlyContributionStr}
              onChangeText={setMonthlyContributionStr}
              placeholder={targetAmountStr ? String(Math.round(parseFloat(targetAmountStr) / 12 || 0)) : 'e.g. 5000'}
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Icon Selection */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 8 }}>
          SELECT GOAL ICON
        </AppText>
        <View style={styles.iconRow}>
          {iconsList.map(ic => {
            const isSelected = selectedIcon === ic;
            return (
              <TouchableOpacity
                key={ic}
                onPress={() => setSelectedIcon(ic)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: isSelected ? colors.cardDark : colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.xs,
                  },
                ]}
              >
                <CategoryIcon
                  name={ic}
                  size={18}
                  color={isSelected ? colors.textInverted : colors.textPrimary}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Linked Account Selection */}
        <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6, marginBottom: 8 }}>
          LINKED ACCOUNT
        </AppText>
        <View style={styles.iconRow}>
          {accounts.map(acc => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setSelectedAccountId(acc.id)}
                style={[
                  styles.accountSelectChip,
                  {
                    backgroundColor: isSelected ? colors.cardDark : colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.xs,
                  },
                ]}
              >
                <AppText
                  variant="labelSmall"
                  style={{
                    color: isSelected ? colors.textInverted : colors.textPrimary,
                  }}
                >
                  {acc.name.toUpperCase()}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <AppButton
          title="CREATE SAVINGS GOAL"
          onPress={handleSave}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.xl, marginBottom: 30 }}
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
  inputPrefixRow: {
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  accountSelectChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
});
