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
  const categoryColor = category?.color || colors.textSecondary;

  const isIncome = transaction.type === 'income';

  // Intelligent merchant & brand visual recognition
  const getMerchantVisual = () => {
    const m = (transaction.merchant || '').toLowerCase();
    if (m.includes('swiggy') || m.includes('zomato')) {
      return { icon: 'Utensils', color: '#FC8019' };
    }
    if (m.includes('coffee') || m.includes('starbucks') || m.includes('blue tokai') || m.includes('cafe')) {
      return { icon: 'Coffee', color: '#C88D58' };
    }
    if (m.includes('uber') || m.includes('ola') || m.includes('rapido')) {
      return { icon: 'Car', color: '#F7B731' };
    }
    if (m.includes('amazon') || m.includes('flipkart') || m.includes('myntra')) {
      return { icon: 'ShoppingBag', color: '#FF9900' };
    }
    if (m.includes('blinkit') || m.includes('zepto') || m.includes('instamart') || m.includes('grocery') || m.includes('whole foods')) {
      return { icon: 'ShoppingCart', color: '#20BF6B' };
    }
    if (m.includes('netflix') || m.includes('spotify') || m.includes('prime') || m.includes('hotstar')) {
      return { icon: 'Film', color: '#EB3B2E' };
    }
    if (m.includes('airtel') || m.includes('jio') || m.includes('bill') || m.includes('electric') || m.includes('utilities')) {
      return { icon: 'Zap', color: '#3867D6' };
    }
    if (isIncome) {
      return { icon: 'Wallet', color: colors.positive };
    }
    return { icon: categoryIconName, color: categoryColor };
  };

  const visual = getMerchantVisual();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        {
          paddingVertical: 12,
          borderBottomColor: colors.borderLight,
          borderBottomWidth: showDivider ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      {/* Left Brand / Category Logo Box with Apple Squircle */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: visual.color ? `${visual.color}1E` : colors.surfaceLighter,
            borderRadius: radius.md,
            width: 40,
            height: 40,
            marginRight: 12,
          },
        ]}
      >
        <CategoryIcon
          name={visual.icon}
          size={18}
          color={visual.color || colors.textPrimary}
          strokeWidth={2.2}
        />
      </View>

      {/* Center Details: Merchant & Category */}
      <View style={styles.centerCol}>
        <AppText
          variant="cardTitle"
          numberOfLines={1}
          style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}
        >
          {transaction.merchant}
        </AppText>
        <AppText
          variant="metadata"
          numberOfLines={1}
          style={{ color: colors.textSecondary, marginTop: 2, fontSize: 13 }}
        >
          {categoryName}{transaction.time ? ` • ${transaction.time}` : ''}
        </AppText>
      </View>

      {/* Right Column: Amount */}
      <View style={styles.rightCol}>
        <AppText
          variant="amountSmall"
          privacySensitive
          style={{
            fontSize: 16,
            fontWeight: '600',
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
