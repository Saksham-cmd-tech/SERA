import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { FinanceGrid } from './FinanceGrid';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <FinanceGrid
        barsCount={16}
        height={32}
        minHeight={8}
        pattern="uniform"
        lineWidth={1}
        lineSpacing={4}
        color={colors.gridLine}
        style={{ marginBottom: spacing.md, alignSelf: 'center' }}
      />
      <AppText
        variant="label"
        style={{
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.xs,
          letterSpacing: 2,
        }}
      >
        {title}
      </AppText>
      <AppText
        variant="bodyMedium"
        style={{
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: actionTitle ? spacing.lg : 0,
        }}
      >
        {subtitle}
      </AppText>
      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={{ alignSelf: 'center' }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
});
