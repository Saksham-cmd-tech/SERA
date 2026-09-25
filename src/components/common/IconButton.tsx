import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  rounded?: boolean;
  bordered?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  size = 40,
  rounded = true,
  bordered = false,
  backgroundColor,
  style,
}) => {
  const { colors, radius } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: rounded ? size / 2 : radius.sm,
          backgroundColor: backgroundColor || colors.transparent,
          borderColor: bordered ? colors.border : colors.transparent,
          borderWidth: bordered ? 1 : 0,
        },
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
