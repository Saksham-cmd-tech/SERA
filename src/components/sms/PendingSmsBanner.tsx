import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { usePendingSmsStore } from '../../store/usePendingSmsStore';

export const PendingSmsBanner: React.FC = () => {
  const { colors, radius, spacing } = useAppTheme();
  const { items, openModal } = usePendingSmsStore();

  const count = items.length;
  if (count === 0) {
    return null;
  }

  const hasSnoozed = items.some(i => i.status === 'later');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openModal}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xs,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: hasSnoozed ? 'rgba(74, 90, 75, 0.15)' : 'rgba(46, 125, 50, 0.15)' },
          ]}
        >
          <CategoryIcon
            name={hasSnoozed ? 'Clock' : 'Zap'}
            size={16}
            color={hasSnoozed ? colors.accent : colors.positive}
            strokeWidth={2.4}
          />
        </View>

        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <AppText
              variant="cardTitle"
              style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 14 }}
            >
              {count} Pending SMS {count === 1 ? 'Transaction' : 'Transactions'}
            </AppText>
            {hasSnoozed && (
              <View
                style={[
                  styles.laterTag,
                  { backgroundColor: colors.surfaceLighter, borderColor: colors.borderLight },
                ]}
              >
                <AppText
                  variant="metadata"
                  style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '700' }}
                >
                  FOR LATER
                </AppText>
              </View>
            )}
          </View>
          <AppText variant="metadata" style={{ color: colors.textSecondary, marginTop: 2 }}>
            Tap to add to SERA, snooze for later, or dismiss
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.actionBadge,
          { backgroundColor: colors.cardDark },
        ]}
      >
        <AppText
          variant="labelSmall"
          style={{ color: colors.textInverted, fontWeight: '700', letterSpacing: 0.8 }}
        >
          REVIEW
        </AppText>
        <CategoryIcon name="ChevronRight" size={13} color={colors.textInverted} strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  laterTag: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderRadius: 3,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
});
