import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selectedValue: T;
  onSelect: (val: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps<T>): React.JSX.Element {
  const { colors, radius } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xs,
        },
      ]}
    >
      {options.map(opt => {
        const isSelected = opt.value === selectedValue;

        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? colors.cardDark : 'transparent',
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{
                color: isSelected ? colors.textInverted : colors.textSecondary,
                letterSpacing: 1.4,
                fontWeight: isSelected ? '700' : '500',
              }}
            >
              {opt.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 3,
    width: '100%',
  },
  option: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
});
