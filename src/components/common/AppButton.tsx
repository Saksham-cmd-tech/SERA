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

export type ButtonVariant = 'primary' | 'accent' | 'coral' | 'bone' | 'outline' | 'surface' | 'ghost';
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
        bg = colors.surfaceLighter;
        borderColor = colors.border;
        borderWidth = 1;
        break;
      case 'accent':
        bg = colors.accentRed;
        break;
      case 'coral':
        bg = colors.coral;
        break;
      case 'bone':
        bg = colors.panelBone;
        borderColor = colors.panelBoneBorder;
        borderWidth = 1;
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
      borderRadius: size === 'large' ? radius.lg : radius.md,
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
        return colors.textPrimary;
      case 'accent':
        return '#FFFFFF';
      case 'coral':
        return colors.coralText;
      case 'bone':
        return colors.panelBoneText;
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
    fontWeight: '800',
  },
});
