import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'SERA',
  size = 36,
  style,
}) => {
  const { colors, radius } = useAppTheme();

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.cardDark,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <AppText
          variant="label"
          style={{
            color: colors.textPrimary,
            fontSize: size * 0.36,
            fontWeight: '800',
            letterSpacing: 1,
          }}
        >
          {getInitials(name)}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
});
