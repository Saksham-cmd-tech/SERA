import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction } from '../../types';
import { useCategoryStore } from '../../store/useCategoryStore';
import { formatSignedAmount } from '../../utils/currency';

interface TransactionRowProps {
  transaction: Transaction;
  onPress: () => void;
  onLongPress?: () => void;
  showDivider?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onPress,
  onLongPress,
  showDivider = true,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();
  const categories = useCategoryStore(state => state.categories);

  const category = categories.find(c => c.id === transaction.categoryId);
  const categoryIconName = category ? category.icon : 'Tag';
  const categoryName = category ? category.name : 'Other';

  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        {
          paddingVertical: spacing.sm + 4,
          borderBottomColor: colors.borderLight,
          borderBottomWidth: showDivider ? 1 : 0,
        },
      ]}
    >
      {/* Left Icon Pill / Rounded Box from Reference 3 */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: colors.cardDark,
            borderRadius: radius.sm,
            marginRight: spacing.md,
          },
        ]}
      >
        <CategoryIcon
          name={categoryIconName}
          size={18}
          color={colors.textInverted}
          strokeWidth={1.7}
        />
      </View>

      {/* Center Details: Merchant & Category */}
      <View style={styles.centerCol}>
        <AppText
          variant="cardTitle"
          numberOfLines={1}
          style={{ color: colors.textPrimary, fontSize: 16, marginBottom: 2 }}
        >
          {transaction.merchant}
        </AppText>
        <AppText
          variant="labelSmall"
          style={{ color: colors.textSecondary, letterSpacing: 1.2 }}
        >
          {categoryName.toUpperCase()}
        </AppText>
      </View>

      {/* Right Column: Amount & Time */}
      <View style={styles.rightCol}>
        <AppText
          variant="amountSmall"
          privacySensitive
          style={{
            fontWeight: '700',
            color: isIncome ? colors.positive : colors.textPrimary,
          }}
        >
          {formatSignedAmount(
            transaction.amount,
            transaction.type,
            currencySymbol,
            isPrivacyMode
          )}
        </AppText>
        <AppText
          variant="metadata"
          style={{ color: colors.textMuted, marginTop: 2, fontSize: 11 }}
        >
          {transaction.time || '12:00 PM'}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCol: {
    flex: 1,
    justifyContent: 'center',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
