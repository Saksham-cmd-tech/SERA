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
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              >
                {isBackspace ? (
                  <CategoryIcon name="Delete" size={20} color={colors.textSecondary} strokeWidth={2} />
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
    marginBottom: 6,
  },
  key: {
    flex: 1,
    height: 52,
    marginHorizontal: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
});
