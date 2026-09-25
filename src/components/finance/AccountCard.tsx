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

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
      case 'savings':
        return 'Wallet';
      case 'credit':
        return 'Receipt';
      case 'investment':
        return 'TrendingUp';
      case 'cash':
        return 'DollarSign';
      default:
        return 'Wallet';
    }
  };

  const isLiability = account.balance < 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
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
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.cardDark, borderRadius: radius.xs },
            ]}
          >
            <CategoryIcon
              name={getAccountIcon(account.type)}
              size={16}
              color={colors.textInverted}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <AppText variant="cardTitle" style={{ color: colors.textPrimary, fontSize: 16 }}>
              {account.name}
            </AppText>
            <AppText variant="metadata" style={{ color: colors.textSecondary }}>
              {account.type.toUpperCase()}{account.accountNumberMask ? ` • ${account.accountNumberMask}` : ''}
            </AppText>
          </View>
        </View>

        <View style={styles.rightBalance}>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{
              fontWeight: '700',
              color: isLiability ? colors.coral : colors.textPrimary,
            }}
          >
            {formatCurrency(account.balance, currencySymbol, isPrivacyMode, false)}
          </AppText>
          {onPressTransfer && (
            <TouchableOpacity
              onPress={onPressTransfer}
              style={{ marginTop: 4 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1 }}>
                TRANSFER ↗
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
    borderWidth: 1,
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
  iconCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightBalance: {
    alignItems: 'flex-end',
  },
});
