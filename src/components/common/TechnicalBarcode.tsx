import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

interface TechnicalBarcodeProps {
  height?: number;
  width?: number;
  bars?: number[];
  color?: string;
  serial?: string;
  showSerial?: boolean;
  style?: ViewStyle;
}

// Default pattern of bar widths (1, 2, 3, 1, 4...)
const DEFAULT_BAR_PATTERN = [
  2, 1, 3, 1, 1, 4, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 4, 2, 1, 1, 3, 1, 2, 1
];

export const TechnicalBarcode: React.FC<TechnicalBarcodeProps> = ({
  height = 28,
  bars = DEFAULT_BAR_PATTERN,
  color,
  serial = 'SERA-SYS // 0815',
  showSerial = true,
  style,
}) => {
  const { colors } = useAppTheme();
  const barColor = color || colors.textPrimary;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.barcodeRow, { height }]}>
        {bars.map((barWidth, idx) => (
          <View
            key={`bc-${idx}`}
            style={{
              width: barWidth,
              height: '100%',
              backgroundColor: barColor,
              marginRight: idx % 2 === 0 ? 2 : 1,
              opacity: 0.85,
            }}
          />
        ))}
      </View>
      {showSerial && (
        <AppText
          variant="metadata"
          style={[styles.serialText, { color: colors.textMuted }]}
        >
          {serial}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  serialText: {
    fontSize: 8,
    letterSpacing: 1.4,
    marginTop: 3,
  },
});
