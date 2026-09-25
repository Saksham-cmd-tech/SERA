import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'pageHeading'
  | 'pageSubheading'
  | 'sectionHeading'
  | 'cardTitle'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'metadata'
  | 'label'
  | 'labelSmall'
  | 'amountLarge'
  | 'amountMedium'
  | 'amountSmall';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverted'
  | 'coral'
  | 'accent'
  | 'positive';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor | string;
  privacySensitive?: boolean;
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMedium',
  color = 'primary',
  privacySensitive = false,
  style,
  children,
  ...rest
}) => {
  const { colors, typography, isPrivacyMode, currencySymbol } = useAppTheme();

  const getTextColor = (): string => {
    switch (color) {
      case 'primary':
        return colors.textPrimary;
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'inverted':
        return colors.textInverted;
      case 'coral':
        return colors.coral;
      case 'accent':
        return colors.accentText;
      case 'positive':
        return colors.positive;
      default:
        return color;
    }
  };

  const textStyle: TextStyle = {
    ...typography[variant],
    color: getTextColor(),
  };

  let renderedContent = children;
  if (privacySensitive && isPrivacyMode) {
    renderedContent = `${currencySymbol}••••••`;
  }

  return (
    <Text style={[textStyle, style]} {...rest}>
      {renderedContent}
    </Text>
  );
};
