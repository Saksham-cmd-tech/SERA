import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { formatCurrency } from '../../utils/currency';

interface FinancialSummaryCardsProps {
  income: number;
  expenses: number;
  savings: number;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  income,
  expenses,
  savings,
}) => {
  const { colors, spacing, radius, currencySymbol, isPrivacyMode } = useAppTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.md }]}>
      <View
        style={[
          styles.cardRow,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
          },
        ]}
      >
        {/* Income Card */}
        <View style={[styles.cardItem, { borderRightColor: colors.border, borderRightWidth: 1 }]}>
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.2, fontWeight: '700' }}>
            INCOME
          </AppText>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: colors.positive, fontWeight: '800', marginTop: 4 }}
          >
            {formatCurrency(income, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>

        {/* Expenses Card */}
        <View style={[styles.cardItem, { borderRightColor: colors.border, borderRightWidth: 1 }]}>
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.2, fontWeight: '700' }}>
            OUTFLOW
          </AppText>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '800', marginTop: 4 }}
          >
            {formatCurrency(expenses, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>

        {/* Savings Card */}
        <View style={styles.cardItem}>
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 1.2, fontWeight: '700' }}>
            SAVED
          </AppText>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: savings >= 0 ? colors.positive : colors.accentRed, fontWeight: '800', marginTop: 4 }}
          >
            {formatCurrency(savings, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusSquare: {
    width: 4,
    height: 4,
    marginRight: 5,
  },
});
