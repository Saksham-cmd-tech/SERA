import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface AccountCardProps {
  account: Account;
  onPress: () => void;
  onPressTransfer?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onPress,
  onPressTransfer,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();

  const getAccountVisual = (type: string) => {
    switch (type) {
      case 'bank':
      case 'savings':
        return { icon: 'Wallet', color: '#3A86FF' };
      case 'credit':
        return { icon: 'Receipt', color: colors.accentRed };
      case 'investment':
        return { icon: 'TrendingUp', color: colors.positive };
      case 'cash':
        return { icon: 'DollarSign', color: '#F7B731' };
      default:
        return { icon: 'Wallet', color: colors.textPrimary };
    }
  };

  const isLiability = account.balance < 0;
  const visual = getAccountVisual(account.type);

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
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: `${visual.color}18`,
                borderRadius: radius.md,
              },
            ]}
          >
            <CategoryIcon
              name={visual.icon}
              size={18}
              color={visual.color}
              strokeWidth={2.2}
            />
          </View>
          <View style={{ marginLeft: 12 }}>
            <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
              {account.name}
            </AppText>
            <AppText variant="metadata" style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
              {account.type.charAt(0).toUpperCase() + account.type.slice(1)}{account.accountNumberMask ? ` • ${account.accountNumberMask}` : ''}
            </AppText>
          </View>
        </View>

        <View style={styles.rightBalance}>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{
              fontWeight: '700',
              color: isLiability ? colors.accentRed : colors.textPrimary,
              textAlign: 'right',
            }}
          >
            {formatCurrency(account.balance, currencySymbol, isPrivacyMode, false)}
          </AppText>
          {onPressTransfer && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressTransfer}
              style={{ marginTop: 4, alignSelf: 'flex-end' }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="labelSmall" style={{ color: colors.accentRed, fontWeight: '600' }}>
                Transfer ↗
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightBalance: {
    alignItems: 'flex-end',
  },
});
