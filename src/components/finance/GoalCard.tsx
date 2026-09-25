import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { GoalStatus } from '../../database/repositories/goalRepository';
import { formatCurrency } from '../../utils/currency';

interface GoalCardProps {
  goal: GoalStatus;
  onPress: () => void;
  onContribute?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onContribute }) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xs,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      {/* Top Header: Icon, Title & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: colors.cardDark, borderRadius: radius.xs },
            ]}
          >
            <CategoryIcon
              name={goal.icon || 'Shield'}
              size={16}
              color={colors.textInverted}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16 }}>
              {goal.name}
            </AppText>
            <AppText variant="metadata" style={{ color: colors.textSecondary }}>
              Target: {goal.targetDate}
            </AppText>
          </View>
        </View>

        {/* ON TRACK / BEHIND badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: goal.isOnTrack ? colors.positive : colors.coral,
              borderRadius: radius.xs,
            },
          ]}
        >
          <AppText
            variant="labelSmall"
            style={{ color: '#FFFFFF', letterSpacing: 1.2, fontWeight: '700' }}
          >
            {goal.isOnTrack ? 'ON TRACK' : 'BEHIND'}
          </AppText>
        </View>
      </View>

      {/* Progress Amount & Percentage */}
      <View style={[styles.amountsRow, { marginTop: spacing.md }]}>
        <View>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700' }}
          >
            {formatCurrency(goal.currentAmount, currencySymbol, isPrivacyMode, false)}
            <AppText
              variant="metadata"
              style={{ color: colors.textSecondary, fontWeight: '400' }}
            >
              {' '}/ {formatCurrency(goal.targetAmount, currencySymbol, isPrivacyMode, false)}
            </AppText>
          </AppText>
        </View>

        <AppText variant="label" style={{ color: colors.textPrimary, fontWeight: '700' }}>
          {goal.percentage}%
        </AppText>
      </View>

      {/* Thin Architectural Progress Bar */}
      <View
        style={[
          styles.progressTrack,
          { backgroundColor: colors.borderLight, borderRadius: 1, marginTop: 8 },
        ]}
      >
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: goal.isOnTrack ? colors.cardDark : colors.coral,
              width: `${Math.min(100, Math.max(2, goal.percentage))}%`,
            },
          ]}
        />
      </View>

      {/* Bottom Contribution Prompt */}
      {onContribute && (
        <View style={[styles.bottomRow, { marginTop: spacing.sm + 2 }]}>
          <AppText variant="metadata" style={{ color: colors.textSecondary }}>
            Need {formatCurrency(goal.calculatedRequiredMonthly, currencySymbol, isPrivacyMode, false)}/mo
          </AppText>
          <TouchableOpacity
            onPress={onContribute}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText
              variant="labelSmall"
              style={{ color: colors.textPrimary, fontWeight: '700', letterSpacing: 1 }}
            >
              + ADD SAVINGS
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressTrack: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
