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
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.lg,
          padding: spacing.md,
          marginBottom: spacing.sm + 2,
        },
      ]}
    >
      {/* Top Header: Icon, Title & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: colors.surfaceLighter,
                borderRadius: radius.md,
              },
            ]}
          >
            <CategoryIcon
              name={goal.icon || 'Shield'}
              size={18}
              color={colors.textPrimary}
            />
          </View>
          <View style={{ marginLeft: 12 }}>
            <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
              {goal.name}
            </AppText>
            <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
              Target: {goal.targetDate}
            </AppText>
          </View>
        </View>

        {/* ON TRACK / BEHIND badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: goal.isOnTrack ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 59, 48, 0.12)',
              borderRadius: radius.full,
              paddingHorizontal: 10,
              paddingVertical: 3,
            },
          ]}
        >
          <AppText
            variant="labelSmall"
            style={{
              color: goal.isOnTrack ? colors.positive : colors.accentRed,
              fontWeight: '600',
              fontSize: 11,
            }}
          >
            {goal.isOnTrack ? 'On Track' : 'Behind'}
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

        <AppText variant="labelSmall" style={{ color: colors.textPrimary, fontWeight: '700' }}>
          {goal.percentage}%
        </AppText>
      </View>

      {/* Solid Rounded Progress Bar */}
      <View
        style={[
          styles.progressTrack,
          {
            backgroundColor: colors.surfaceLighter,
            borderRadius: radius.full,
            height: 6,
            marginTop: 8,
            overflow: 'hidden',
          },
        ]}
      >
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: goal.isOnTrack ? colors.positive : colors.accentRed,
              borderRadius: radius.full,
              height: '100%',
              width: `${Math.min(100, Math.max(2, goal.percentage))}%`,
            },
          ]}
        />
      </View>

      {/* Bottom Contribution Prompt */}
      {onContribute && (
        <View
          style={[
            styles.bottomRow,
            {
              marginTop: spacing.sm + 4,
              borderTopColor: colors.borderLight,
              borderTopWidth: StyleSheet.hairlineWidth,
              paddingTop: 10,
            },
          ]}
        >
          <AppText variant="metadata" style={{ color: colors.textSecondary }}>
            Need {formatCurrency(goal.calculatedRequiredMonthly, currencySymbol, isPrivacyMode, false)}/mo
          </AppText>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onContribute}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText
              variant="labelSmall"
              style={{ color: colors.accentRed, fontWeight: '700', letterSpacing: 0.3 }}
            >
              + Add Savings
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressTrack: {
    width: '100%',
  },
  progressBar: {},
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
