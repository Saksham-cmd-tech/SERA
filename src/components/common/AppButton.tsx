import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'accent' | 'coral' | 'outline' | 'surface' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { colors, radius, spacing } = useAppTheme();

  const getContainerStyle = (): ViewStyle => {
    let bg = colors.cardDark;
    let borderColor = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'primary':
        bg = colors.cardDark;
        break;
      case 'accent':
        bg = colors.accent;
        break;
      case 'coral':
        bg = colors.coral;
        break;
      case 'surface':
        bg = colors.surface;
        borderColor = colors.border;
        borderWidth = 1;
        break;
      case 'outline':
        bg = 'transparent';
        borderColor = colors.border;
        borderWidth = 1;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
    }

    let paddingVertical = spacing.sm + 2;
    let paddingHorizontal = spacing.md;

    if (size === 'small') {
      paddingVertical = spacing.xs + 2;
      paddingHorizontal = spacing.sm + 4;
    } else if (size === 'large') {
      paddingVertical = spacing.md;
      paddingHorizontal = spacing.lg;
    }

    return {
      backgroundColor: bg,
      borderColor,
      borderWidth,
      borderRadius: radius.sm,
      paddingVertical,
      paddingHorizontal,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.45 : 1,
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.textInverted;
      case 'accent':
        return colors.accentText;
      case 'coral':
        return colors.coralText;
      case 'outline':
      case 'surface':
      case 'ghost':
        return colors.textPrimary;
      default:
        return colors.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <AppText
            variant={size === 'small' ? 'labelSmall' : 'label'}
            style={[
              styles.text,
              { color: getTextColor() },
              icon && iconPosition === 'left' ? { marginLeft: spacing.xs + 2 } : undefined,
              icon && iconPosition === 'right' ? { marginRight: spacing.xs + 2 } : undefined,
              textStyle,
            ]}
          >
            {title}
          </AppText>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    letterSpacing: 1.4,
  },
});
