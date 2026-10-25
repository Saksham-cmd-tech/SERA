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
            backgroundColor: colors.surfaceCard,
            borderColor: colors.borderLight,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: radius.lg,
          },
        ]}
      >
        {/* Income Card */}
        <View style={[styles.cardItem, { borderRightColor: colors.borderLight, borderRightWidth: StyleSheet.hairlineWidth }]}>
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 0.2, fontWeight: '600', fontSize: 11 }}>
            Income
          </AppText>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: colors.positive, fontWeight: '700', fontSize: 15, marginTop: 3 }}
          >
            {formatCurrency(income, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>

        {/* Expenses Card */}
        <View style={[styles.cardItem, { borderRightColor: colors.borderLight, borderRightWidth: StyleSheet.hairlineWidth }]}>
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 0.2, fontWeight: '600', fontSize: 11 }}>
            Outflow
          </AppText>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 15, marginTop: 3 }}
          >
            {formatCurrency(expenses, currencySymbol, isPrivacyMode, false)}
          </AppText>
        </View>

        {/* Savings Card */}
        <View style={styles.cardItem}>
          <AppText variant="labelSmall" style={{ color: colors.textSecondary, letterSpacing: 0.2, fontWeight: '600', fontSize: 11 }}>
            Saved
          </AppText>
          <AppText
            variant="amountSmall"
            privacySensitive
            style={{ color: savings >= 0 ? colors.positive : colors.accentRed, fontWeight: '700', fontSize: 15, marginTop: 3 }}
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
