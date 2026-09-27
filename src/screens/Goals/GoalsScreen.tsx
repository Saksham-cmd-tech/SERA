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
      <View style={[styles.headerWrap, { paddingHorizontal: spacing.screenPadding }]}>
        <Header
          subtitle="TARGETS"
          title="Savings Goals"
          rightAction={
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateGoal')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.plusIconBtn, { backgroundColor: colors.cardDark }]}
            >
              <CategoryIcon name="Plus" size={16} color={colors.textInverted} strokeWidth={2.2} />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenPadding },
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
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xs,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
            TOTAL SAVED FOR GOALS
          </AppText>
          <AppText
            variant="displayMedium"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 2 }}
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
            title="NO SAVINGS GOALS"
            subtitle="Create a goal and start building toward your dreams."
            actionTitle="+ CREATE GOAL"
            onAction={() => navigation.navigate('CreateGoal')}
          />
        )}

        <AppButton
          title="+ NEW SAVINGS GOAL"
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
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setContributionModalVisible(false)}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.contributeSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
              },
            ]}
          >
            <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.6 }}>
              ADD TO SAVINGS GOAL
            </AppText>
            <AppText
              variant="cardTitle"
              style={{ color: colors.textPrimary, fontSize: 20, marginTop: 2, marginBottom: spacing.md }}
            >
              {selectedGoal?.name}
            </AppText>

            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
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
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                },
              ]}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary }}>
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
              title="CONFIRM DEPOSIT"
              onPress={handleSaveContribution}
              variant="primary"
              size="large"
            />
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
  plusIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contributeSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
  },
  inputWrapper: {
    borderWidth: 1,
  },
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
