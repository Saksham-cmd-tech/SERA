import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { CategoryIcon } from './CategoryIcon';

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
          backgroundColor: colors.surfaceCard,
          borderColor: colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.lg,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: colors.surfaceLighter,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: spacing.md,
        }}
      >
        <CategoryIcon name="Inbox" size={24} color={colors.textSecondary} strokeWidth={2} />
      </View>
      <AppText
        variant="cardTitle"
        style={{
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.xs,
          fontSize: 17,
          fontWeight: '600',
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
          lineHeight: 20,
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
          style={{ alignSelf: 'center', paddingHorizontal: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
});
