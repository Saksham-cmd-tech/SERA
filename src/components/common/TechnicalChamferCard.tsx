import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

export type CardThemeVariant = 'dark' | 'bone' | 'accent' | 'slate' | 'outline';

interface TechnicalChamferCardProps {
  children?: React.ReactNode;
  variant?: CardThemeVariant;
  chamferCorner?: 'topRight' | 'bottomRight' | 'topLeft' | 'none';
  chamferSize?: number;
  specCode?: string;
  headerTitle?: string;
  headerRight?: React.ReactNode;
  showCrosshairs?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const TechnicalChamferCard: React.FC<TechnicalChamferCardProps> = ({
  children,
  variant = 'dark',
  chamferCorner = 'topRight',
  chamferSize = 18,
  specCode,
  headerTitle,
  headerRight,
  showCrosshairs = true,
  style,
  contentStyle,
}) => {
  const { colors, radius, spacing } = useAppTheme();
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== dimensions.width || height !== dimensions.height) {
      setDimensions({ width, height });
    }
  };

  let bgColor = colors.surface;
  let strokeColor = colors.border;
  let titleColor = colors.textPrimary;
  let specColor = colors.textSecondary;

  switch (variant) {
    case 'bone':
      bgColor = colors.panelBone;
      strokeColor = colors.panelBoneBorder;
      titleColor = colors.panelBoneText;
      specColor = colors.panelBoneMuted;
      break;
    case 'accent':
      bgColor = colors.accentRed;
      strokeColor = colors.accentRedDark;
      titleColor = '#FFFFFF';
      specColor = 'rgba(255, 255, 255, 0.7)';
      break;
    case 'slate':
      bgColor = colors.cardDark;
      strokeColor = colors.border;
      titleColor = colors.textPrimary;
      specColor = colors.textSecondary;
      break;
    case 'outline':
      bgColor = 'transparent';
      strokeColor = colors.border;
      titleColor = colors.textPrimary;
      specColor = colors.textSecondary;
      break;
    case 'dark':
    default:
      bgColor = colors.surface;
      strokeColor = colors.border;
      titleColor = colors.textPrimary;
      specColor = colors.textSecondary;
      break;
  }

  const { width, height } = dimensions;
  const c = chamferSize;

  let pathD = '';
  if (width > 0 && height > 0) {
    if (chamferCorner === 'topRight') {
      pathD = `M 0 0 L ${width - c} 0 L ${width} ${c} L ${width} ${height} L 0 ${height} Z`;
    } else if (chamferCorner === 'bottomRight') {
      pathD = `M 0 0 L ${width} 0 L ${width} ${height - c} L ${width - c} ${height} L 0 ${height} Z`;
    } else if (chamferCorner === 'topLeft') {
      pathD = `M ${c} 0 L ${width} 0 L ${width} ${height} L 0 ${height} L 0 ${c} Z`;
    } else {
      pathD = `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
    }
  }

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.wrapper,
        style,
      ]}
    >
      {/* Background SVG with exact polygon path & crisp hairline stroke */}
      {width > 0 && height > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={height}>
            <Path
              d={pathD}
              fill={bgColor}
              stroke={strokeColor}
              strokeWidth={1}
            />
          </Svg>
        </View>
      )}

      {/* Crosshair registration marks on corners */}
      {showCrosshairs && variant === 'dark' && (
        <>
          <AppText variant="metadata" style={[styles.crosshair, styles.topLeftCross]}>
            +
          </AppText>
          <AppText variant="metadata" style={[styles.crosshair, styles.bottomRightCross]}>
            +
          </AppText>
        </>
      )}

      {/* Header bar if title or specCode specified */}
      {(headerTitle || specCode || headerRight) && (
        <View style={[styles.headerRow, { paddingHorizontal: spacing.md, paddingTop: spacing.sm + 2 }]}>
          <View style={styles.headerLeft}>
            {specCode && (
              <AppText
                variant="labelSmall"
                style={[styles.specText, { color: specColor }]}
              >
                {specCode}
              </AppText>
            )}
            {headerTitle && (
              <AppText
                variant="cardTitle"
                style={[styles.headerTitle, { color: titleColor }]}
              >
                {headerTitle}
              </AppText>
            )}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}

      {/* Inner Content */}
      <View style={[styles.content, { padding: spacing.md }, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  content: {
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  specText: {
    letterSpacing: 1.4,
    fontSize: 9,
    marginBottom: 2,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  crosshair: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 10,
    zIndex: 3,
  },
  topLeftCross: {
    top: 4,
    left: 6,
  },
  bottomRightCross: {
    bottom: 4,
    right: 6,
  },
});
