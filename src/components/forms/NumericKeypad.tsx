import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';

interface NumericKeypadProps {
  onKeyPress: (char: string) => void;
  onDelete: () => void;
  onClear?: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onDelete,
}) => {
  const { colors, spacing, radius } = useAppTheme();

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.sm }]}>
      {keys.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.row}>
          {row.map(k => {
            const isBackspace = k === 'backspace';

            return (
              <TouchableOpacity
                key={k}
                activeOpacity={0.65}
                onPress={() => {
                  if (isBackspace) {
                    onDelete();
                  } else {
                    onKeyPress(k);
                  }
                }}
                style={[
                  styles.key,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                    borderRadius: radius.xs,
                  },
                ]}
              >
                {isBackspace ? (
                  <CategoryIcon name="Trash2" size={20} color={colors.textPrimary} />
                ) : (
                  <AppText
                    variant="displayMedium"
                    style={[styles.keyText, { color: colors.textPrimary }]}
                  >
                    {k}
                  </AppText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  key: {
    flex: 1,
    height: 56,
    marginHorizontal: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '600',
  },
});
