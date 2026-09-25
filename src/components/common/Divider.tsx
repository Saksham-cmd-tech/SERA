import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface DividerProps {
  vertical?: boolean;
  color?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ vertical = false, color, style }) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: color || colors.border },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
