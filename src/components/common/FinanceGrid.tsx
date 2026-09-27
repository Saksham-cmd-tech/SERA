import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface FinanceGridProps {
  barsCount?: number;
  height?: number;
  minHeight?: number;
  color?: string;
  activeColor?: string;
  progress?: number; // 0 to 1
  lineWidth?: number;
  lineSpacing?: number;
  pattern?: 'wave' | 'ascending' | 'descending' | 'random' | 'uniform' | 'reference';
  style?: ViewStyle;
}

export const FinanceGrid: React.FC<FinanceGridProps> = ({
  barsCount = 28,
  height = 56,
  minHeight = 14,
  color,
  activeColor,
  progress = 0.65,
  lineWidth = 1,
  lineSpacing = 3,
  pattern = 'reference',
  style,
}) => {
  const { colors } = useAppTheme();
  const baseColor = color || colors.textPrimary;
  const highlightColor = activeColor || colors.textPrimary;

  const heights = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < barsCount; i++) {
      const ratio = i / (barsCount - 1 || 1);
      let barH: number;

      switch (pattern) {
        case 'ascending':
          barH = minHeight + ratio * (height - minHeight);
          break;
        case 'descending':
          barH = height - ratio * (height - minHeight);
          break;
        case 'wave':
          // Subtle architectural sine wave
          barH = minHeight + ((Math.sin(ratio * Math.PI * 2) + 1) / 2) * (height - minHeight);
          break;
        case 'uniform':
          barH = height;
          break;
        case 'reference':
        default:
          barH = height;
          break;
      }
      list.push(Math.round(barH));
    }
    return list;
  }, [barsCount, height, minHeight, pattern]);

  const activeBarsIndex = useMemo(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    if (clamped <= 0) {
      return 0;
    }
    if (clamped >= 1) {
      return barsCount;
    }
    const rounded = Math.round(barsCount * clamped);
    return Math.max(1, rounded);
  }, [barsCount, progress]);

  return (
    <View style={[styles.container, { height }, style]}>
      {heights.map((barHeight, idx) => {
        const isActive = idx < activeBarsIndex;
        return (
          <View
            key={`bar-${idx}`}
            style={[
              styles.bar,
              {
                width: lineWidth,
                height: barHeight,
                marginRight: idx === barsCount - 1 ? 0 : lineSpacing,
                backgroundColor: isActive ? highlightColor : baseColor,
                opacity: isActive ? 0.95 : (color ? 0.4 : 0.22),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 0.5,
  },
});
