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
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
      ]}
    >
      {options.map(opt => {
        const isSelected = opt.value === selectedValue;
        let activeBg = colors.surfaceCard;
        let activeText = colors.textPrimary;

        if (opt.value === 'expense') {
          activeBg = colors.accentRed;
          activeText = '#FFFFFF';
        } else if (opt.value === 'income') {
          activeBg = isSelected ? colors.surfaceCard : 'transparent';
          activeText = colors.positive;
        } else if (opt.value === 'transfer') {
          activeBg = isSelected ? colors.surfaceCard : 'transparent';
          activeText = colors.textPrimary;
        }

        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? activeBg : 'transparent',
                borderRadius: radius.sm,
              },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={{
                color: isSelected ? activeText : colors.textSecondary,
                letterSpacing: 1.4,
                fontWeight: isSelected ? '800' : '600',
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
    padding: 4,
    width: '100%',
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
