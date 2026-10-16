import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { CategoryIcon } from '../common/CategoryIcon';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  centerTitle?: boolean;
  showAvatar?: boolean;
  avatarName?: string;
  onPressAvatar?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
  cancelText?: string;
  onPressCancel?: () => void;
  showSeraMonogram?: boolean;
  showNotification?: boolean;
  onPressNotification?: () => void;
  showMenu?: boolean;
  onPressMenu?: () => void;
  rightAction?: React.ReactNode;
  noBorder?: boolean;
  height?: number;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  centerTitle = false,
  showAvatar = false,
  avatarName,
  onPressAvatar,
  showBack = false,
  onPressBack,
  cancelText,
  onPressCancel,
  showSeraMonogram = false,
  showNotification = false,
  onPressNotification,
  showMenu = false,
  onPressMenu,
  rightAction,
  noBorder = false,
  height = 54,
  style,
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: noBorder ? 0 : 1,
          paddingHorizontal: spacing.screenPadding,
        },
        style,
      ]}
    >
      {/* Left Section: Cancel Text, Back Chevron, or Avatar */}
      <View style={styles.leftCol}>
        {cancelText ? (
          <TouchableOpacity
            onPress={onPressCancel || onPressBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.cancelBtn}
          >
            <AppText style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
              {cancelText}
            </AppText>
          </TouchableOpacity>
        ) : showBack && onPressBack ? (
          <TouchableOpacity
            onPress={onPressBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            <CategoryIcon name="ChevronLeft" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : showAvatar ? (
          <TouchableOpacity
            onPress={onPressAvatar}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.avatarCircle,
              {
                backgroundColor: colors.cardDark,
                borderColor: colors.border,
              },
            ]}
          >
            <AppText style={[styles.avatarInitial, { color: colors.textPrimary }]}>
              {(avatarName || 'U').charAt(0).toUpperCase()}
            </AppText>
          </TouchableOpacity>
        ) : null}

        {/* Left Subtitle & Title (when not centered) */}
        {!centerTitle && (subtitle || title) ? (
          <View style={[styles.titleCol, (showAvatar || showBack) && { marginLeft: 10 }]}>
            {subtitle ? (
              <AppText
                variant="labelSmall"
                style={[styles.subtitleText, { color: colors.textSecondary }]}
              >
                {subtitle.toUpperCase()}
              </AppText>
            ) : null}
            {title ? (
              <AppText
                variant="cardTitle"
                numberOfLines={1}
                style={[
                  styles.titleText,
                  { color: colors.textPrimary },
                  !subtitle && styles.titleOnlyText,
                ]}
              >
                {title}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Centered Title (when centerTitle is true) */}
      {centerTitle && title ? (
        <View style={styles.centerContainer} pointerEvents="none">
          {subtitle ? (
            <AppText
              variant="labelSmall"
              style={[styles.subtitleText, { color: colors.textSecondary, textAlign: 'center' }]}
            >
              {subtitle.toUpperCase()}
            </AppText>
          ) : null}
          <AppText
            style={[styles.centeredTitleText, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </AppText>
        </View>
      ) : null}

      {/* Right Section */}
      <View style={styles.rightCol}>
        {rightAction ? (
          rightAction
        ) : (
          <View style={styles.rightActionsRow}>
            {showSeraMonogram ? (
              <View
                style={[
                  styles.seraPill,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.border,
                  },
                ]}
              >
                <AppText style={[styles.seraPillText, { color: colors.accentRed }]}>
                  SERA
                </AppText>
              </View>
            ) : null}

            {showNotification ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPressNotification}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.border,
                  },
                ]}
              >
                <CategoryIcon name="Bell" size={16} color={colors.textSecondary} />
                <View style={[styles.alertDot, { backgroundColor: colors.accentRed }]} />
              </TouchableOpacity>
            ) : null}

            {showMenu && onPressMenu ? (
              <TouchableOpacity
                onPress={onPressMenu}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.menuGridIcon}
              >
                <View style={styles.dotGrid}>
                  <View style={styles.dotRow}>
                    <View style={[styles.dot, { backgroundColor: colors.textPrimary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.textPrimary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.textPrimary }]} />
                  </View>
                  <View style={[styles.dotRow, { marginTop: 3 }]}>
                    <View style={[styles.dot, { backgroundColor: colors.textPrimary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.textPrimary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.textPrimary }]} />
                  </View>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: '700',
  },
  titleCol: {
    justifyContent: 'center',
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 12,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 1,
  },
  titleOnlyText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 0,
  },
  centerContainer: {
    position: 'absolute',
    left: 60,
    right: 60,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredTitleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seraPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  seraPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  alertDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  menuGridIcon: {
    padding: 6,
  },
  dotGrid: {
    width: 18,
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 16,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1,
  },
});
