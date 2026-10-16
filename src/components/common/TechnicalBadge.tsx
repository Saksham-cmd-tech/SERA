import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

export type TechnicalBadgeVariant = 'dark' | 'accent' | 'bone' | 'outline' | 'slate';

interface TechnicalBadgeProps {
  label: string;
  value?: string | number;
  variant?: TechnicalBadgeVariant;
  size?: 'small' | 'medium';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const TechnicalBadge: React.FC<TechnicalBadgeProps> = ({
  label,
  value,
  variant = 'dark',
  size = 'small',
  icon,
  style,
  textStyle,
}) => {
  const { colors, radius } = useAppTheme();

  let bg = colors.surfaceLighter;
  let borderColor = colors.border;
  let textColor = colors.textPrimary;
  let valueColor = colors.accentRed;

  switch (variant) {
    case 'accent':
      bg = colors.accentRed;
      borderColor = colors.accentRedDark;
      textColor = '#FFFFFF';
      valueColor = '#FFFFFF';
      break;
    case 'bone':
      bg = colors.panelBone;
      borderColor = colors.panelBoneBorder;
      textColor = colors.panelBoneText;
      valueColor = colors.accentRed;
      break;
    case 'outline':
      bg = 'transparent';
      borderColor = colors.border;
      textColor = colors.textSecondary;
      valueColor = colors.textPrimary;
      break;
    case 'slate':
      bg = colors.cardDark;
      borderColor = colors.border;
      textColor = colors.textPrimary;
      valueColor = colors.accentRed;
      break;
    case 'dark':
    default:
      bg = colors.cardDarker;
      borderColor = colors.border;
      textColor = colors.textSecondary;
      valueColor = colors.textPrimary;
      break;
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor,
          borderRadius: radius.xs,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 7 : 10,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <AppText
        variant="labelSmall"
        style={[
          styles.labelText,
          {
            color: textColor,
            fontSize: isSmall ? 8.5 : 10,
          },
          textStyle,
        ]}
      >
        {label}
      </AppText>
      {value !== undefined && value !== null && (
        <AppText
          variant="labelSmall"
          style={[
            styles.valueText,
            {
              color: valueColor,
              fontSize: isSmall ? 9 : 10.5,
              fontWeight: '800',
              marginLeft: 5,
            },
          ]}
        >
          {String(value)}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconWrap: {
    marginRight: 4,
  },
  labelText: {
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  valueText: {
    letterSpacing: 1.0,
  },
});
