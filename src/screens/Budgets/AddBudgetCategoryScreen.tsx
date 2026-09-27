import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/common/AppText';
import { Header } from '../../components/navigation/Header';
import { CategoryBlock } from '../../components/finance/CategoryBlock';
import { NumericKeypad } from '../../components/forms/NumericKeypad';
import { AppButton } from '../../components/common/AppButton';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { Category } from '../../types';

interface AddBudgetCategoryScreenProps {
  navigation: any;
}

export const AddBudgetCategoryScreen: React.FC<AddBudgetCategoryScreenProps> = ({
  navigation,
}) => {
  const { colors, spacing, radius, currencySymbol } = useAppTheme();
  const { setCategoryBudget } = useBudgetStore();
  const categories = useCategoryStore(state => state.categories);

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0] || {
      id: 'cat-food',
      name: 'Food',
      icon: 'Utensils',
      color: '#E4CF55',
      type: 'expense',
      isDefault: true,
      budgetLimit: 8000,
      createdAt: new Date().toISOString(),
    }
  );

  const [amountStr, setAmountStr] = useState<string>(
    selectedCategory?.budgetLimit ? selectedCategory.budgetLimit.toString() : '0'
  );
  const [keypadVisible, setKeypadVisible] = useState<boolean>(true);
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [rollover, setRollover] = useState<boolean>(true);
  const [selectedThresholds, setSelectedThresholds] = useState<number[]>([50, 75, 90, 100]);

  const handleKeyPress = (char: string) => {
    if (char === '.') return; // integer budgets preferred
    if (amountStr === '0') {
      setAmountStr(char);
    } else {
      if (amountStr.length >= 7) return;
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

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    if (cat.budgetLimit) {
      setAmountStr(cat.budgetLimit.toString());
    }
  };

  const toggleThreshold = (val: number) => {
    if (selectedThresholds.includes(val)) {
      setSelectedThresholds(selectedThresholds.filter(t => t !== val));
    } else {
      setSelectedThresholds([...selectedThresholds, val].sort((a, b) => a - b));
    }
  };

  const handleSave = async () => {
    const limit = parseFloat(amountStr);
    if (!limit || limit <= 0) {
      Alert.alert('Invalid Amount', 'Please set a budget limit greater than 0.');
      return;
    }

    try {
      await setCategoryBudget(selectedCategory.id, limit);
      Alert.alert('Saved', `Budget for ${selectedCategory.name} updated to ${currencySymbol}${limit}.`);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save budget category.');
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
          subtitle="Add your"
          title="Budget Category"
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Highlighted Yellow Category Block (Exact Reference Screenshot 2) */}
        <CategoryBlock
          name={selectedCategory.name}
          amount={parseFloat(amountStr) || 0}
          highlighted={true}
          onPress={() => setKeypadVisible(!keypadVisible)}
          onPressPlus={() => setKeypadVisible(true)}
          isAddMode={true}
        />

        {/* Custom Numeric Keypad for fast budget limit entry */}
        {keypadVisible && (
          <View style={{ marginBottom: spacing.md }}>
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
            />
          </View>
        )}

        {/* Stacked Dark Olive Green Category Selection Blocks (Exact Reference 2) */}
        <AppText
          variant="label"
          style={{
            color: colors.textSecondary,
            letterSpacing: 1.6,
            marginTop: spacing.sm,
            marginBottom: spacing.xs,
          }}
        >
          AVAILABLE CATEGORIES
        </AppText>

        {categories
          .filter(c => c.id !== selectedCategory.id && c.type !== 'income')
          .slice(0, 5)
          .map(cat => (
            <CategoryBlock
              key={cat.id}
              name={cat.name}
              amount={cat.budgetLimit || 0}
              highlighted={false}
              onPress={() => handleSelectCategory(cat)}
              isAddMode={true}
            />
          ))}

        {/* Period & Rollover Controls */}
        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginTop: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          {/* Period selector */}
          <View style={styles.periodRow}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
              BUDGET PERIOD
            </AppText>
            <View style={styles.periodPills}>
              {(['monthly', 'weekly'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p)}
                  style={[
                    styles.periodPill,
                    {
                      backgroundColor: period === p ? colors.cardDark : colors.background,
                      borderColor: colors.border,
                      borderRadius: radius.xs,
                    },
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    style={{
                      color: period === p ? colors.textInverted : colors.textPrimary,
                    }}
                  >
                    {p.toUpperCase()}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rollover Toggle */}
          <View style={[styles.switchRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <View>
              <AppText variant="labelSmall" style={{ color: colors.textPrimary }}>
                ROLLOVER UNUSED BUDGET
              </AppText>
              <AppText variant="metadata" style={{ color: colors.textSecondary }}>
                Carry forward remaining balance to next period
              </AppText>
            </View>
            <Switch
              value={rollover}
              onValueChange={setRollover}
              trackColor={{ false: colors.border, true: colors.cardDark }}
              thumbColor={rollover ? colors.accent : '#F4F4F4'}
            />
          </View>

          {/* Alert Thresholds */}
          <View style={[styles.thresholdsRow, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
            <AppText variant="labelSmall" style={{ color: colors.textSecondary, marginBottom: 8 }}>
              ALERT THRESHOLDS
            </AppText>
            <View style={styles.thresholdChips}>
              {[50, 75, 90, 100].map(th => {
                const isActive = selectedThresholds.includes(th);
                return (
                  <TouchableOpacity
                    key={th}
                    onPress={() => toggleThreshold(th)}
                    style={[
                      styles.thresholdChip,
                      {
                        backgroundColor: isActive ? colors.accent : colors.background,
                        borderColor: colors.border,
                        borderRadius: radius.xs,
                      },
                    ]}
                  >
                    <AppText
                      variant="labelSmall"
                      style={{
                        color: isActive ? colors.accentText : colors.textPrimary,
                        fontWeight: '700',
                      }}
                    >
                      {th}%
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <AppButton
          title="SAVE BUDGET CATEGORY"
          onPress={handleSave}
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
  settingsCard: {
    borderWidth: 1,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  periodPills: {
    flexDirection: 'row',
  },
  periodPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginLeft: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  thresholdsRow: {
    paddingTop: 12,
  },
  thresholdChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thresholdChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
});
