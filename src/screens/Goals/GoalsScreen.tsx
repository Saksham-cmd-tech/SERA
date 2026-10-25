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
import { GoalCard } from '../../components/finance/GoalCard';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { useGoalStore } from '../../store/useGoalStore';
import { GoalStatus } from '../../database/repositories/goalRepository';
import { formatCurrency } from '../../utils/currency';

interface GoalsScreenProps {
  navigation: any;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const { goals, loadGoals, addContribution, isLoading } = useGoalStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalStatus | null>(null);
  const [contributionModalVisible, setContributionModalVisible] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNotes, setContributionNotes] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const handleOpenContribute = (goal: GoalStatus) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setContributionNotes('');
    setContributionModalVisible(true);
  };

  const handleSaveContribution = async () => {
    if (!selectedGoal) return;
    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid contribution amount.');
      return;
    }

    await addContribution(selectedGoal.id, amount, contributionNotes);
    setContributionModalVisible(false);
    Alert.alert('Savings Added', `Added ${currencySymbol}${amount} to ${selectedGoal.name}.`);
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header
        subtitle="Savings"
        title="Goals & Vaults"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreateGoal')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.plusIconBtn,
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
        {/* Cumulative Savings Summary Card */}
        <View
          style={[
            styles.summaryCard,
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
          <AppText
            variant="sectionHeading"
            style={{ color: colors.textSecondary }}
          >
            TOTAL SAVED FOR GOALS
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 4 }}
          >
            {formatCurrency(totalSaved, currencySymbol, isPrivacyMode, false)}
          </AppText>
          <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Target: {formatCurrency(totalTarget, currencySymbol, isPrivacyMode, false)} across {goals.length} active goals
          </AppText>
        </View>

        {/* Goals List */}
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onPress={() => handleOpenContribute(goal)}
            onContribute={() => handleOpenContribute(goal)}
          />
        ))}

        {goals.length === 0 && (
          <EmptyState
            title="No Savings Goals"
            subtitle="Create a goal and start building toward your dreams."
            actionTitle="Create Goal"
            onAction={() => navigation.navigate('CreateGoal')}
          />
        )}

        <AppButton
          title="New Savings Goal"
          onPress={() => navigation.navigate('CreateGoal')}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.md, marginBottom: 30 }}
        />
      </ScrollView>

      {/* Contribution Modal */}
      <Modal
        visible={contributionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setContributionModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setContributionModalVisible(false)}
            style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
              style={[
                styles.contributeSheet,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.borderLight,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderRadius: radius.xl,
                  padding: spacing.lg,
                },
              ]}
            >
              {/* Apple Sheet Drag Indicator */}
              <View style={styles.sheetHandleWrap}>
                <View style={[styles.sheetHandle, { backgroundColor: colors.borderLight }]} />
              </View>

              <AppText
                variant="sectionHeading"
                style={{ color: colors.textSecondary }}
              >
                ADD TO SAVINGS GOAL
              </AppText>
              <AppText
                variant="cardTitle"
                style={{ color: colors.textPrimary, fontSize: 20, marginTop: 4, marginBottom: spacing.md, fontWeight: '700' }}
              >
                {selectedGoal?.name}
              </AppText>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surfaceLighter,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
                  AMOUNT TO DEPOSIT
                </AppText>
                <TextInput
                  value={contributionAmount}
                  onChangeText={setContributionAmount}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[styles.numericInput, { color: colors.textPrimary }]}
                  autoFocus
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surfaceLighter,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                  },
                ]}
              >
                <AppText variant="labelSmall" style={{ color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 }}>
                  OPTIONAL NOTE
                </AppText>
                <TextInput
                  value={contributionNotes}
                  onChangeText={setContributionNotes}
                  placeholder="e.g. Monthly transfer, bonus payout"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              <AppButton
                title="Deposit Savings"
                onPress={handleSaveContribution}
                variant="primary"
                size="large"
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
  plusIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contributeSheet: {
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
  inputWrapper: {},
  numericInput: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
    paddingVertical: 0,
  },
  textInput: {
    fontSize: 15,
    marginTop: 4,
    paddingVertical: 0,
  },
});
