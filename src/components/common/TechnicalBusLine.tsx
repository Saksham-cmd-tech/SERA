import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppTheme } from '../../hooks/useAppTheme';

interface TechnicalBusLineProps {
  width?: number | string;
  height?: number;
  color?: string;
  strokeWidth?: number;
  variant?: 'diagonal' | 'step' | 'connector';
  showPads?: boolean;
  style?: ViewStyle;
}

export const TechnicalBusLine: React.FC<TechnicalBusLineProps> = ({
  height = 50,
  color,
  strokeWidth = 1.5,
  variant = 'diagonal',
  showPads = true,
  style,
}) => {
  const { colors } = useAppTheme();
  const strokeColor = color || 'rgba(255, 255, 255, 0.15)';

  return (
    <View style={[styles.container, { height }, style]} pointerEvents="none">
      <Svg width="100%" height={height} viewBox="0 0 300 50" preserveAspectRatio="none">
        {variant === 'diagonal' && (
          <>
            <Path
              d="M 10 10 L 100 10 L 140 40 L 290 40"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {showPads && (
              <>
                <Circle cx="10" cy="10" r="2.5" fill={strokeColor} />
                <Circle cx="290" cy="40" r="2.5" fill={strokeColor} />
              </>
            )}
          </>
        )}
        {variant === 'step' && (
          <>
            <Path
              d="M 20 40 L 80 40 L 120 12 L 280 12"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {showPads && (
              <>
                <Circle cx="20" cy="40" r="2.5" fill={strokeColor} />
                <Circle cx="280" cy="12" r="2.5" fill={strokeColor} />
              </>
            )}
          </>
        )}
        {variant === 'connector' && (
          <>
            <Path
              d="M 30 5 L 80 5 L 110 35 L 220 35 L 240 15 L 290 15"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {showPads && (
              <>
                <Circle cx="30" cy="5" r="2.5" fill={strokeColor} />
                <Circle cx="110" cy="35" r="2" fill={strokeColor} />
                <Circle cx="290" cy="15" r="2.5" fill={strokeColor} />
              </>
            )}
          </>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});
