import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../common/AppText';
import { Avatar } from '../common/Avatar';
import { CategoryIcon } from '../common/CategoryIcon';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
  onPressAvatar?: () => void;
  showMenu?: boolean;
  onPressMenu?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
  rightAction?: React.ReactNode;
  avatarName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showAvatar = false,
  onPressAvatar,
  showMenu = false,
  onPressMenu,
  showBack = false,
  onPressBack,
  rightAction,
  avatarName,
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.sm + 2 }]}>
      {/* Left section: Back button or Avatar */}
      <View style={styles.leftCol}>
        {showBack && onPressBack ? (
          <TouchableOpacity
            onPress={onPressBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
          >
            <CategoryIcon name="ChevronRight" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : showAvatar ? (
          <TouchableOpacity onPress={onPressAvatar} activeOpacity={0.8}>
            <Avatar size={36} name={avatarName || 'Alexander'} />
          </TouchableOpacity>
        ) : null}

        {subtitle && (
          <View style={{ marginLeft: showAvatar || showBack ? 12 : 0 }}>
            <AppText
              variant="labelSmall"
              style={{ color: colors.textSecondary, letterSpacing: 1.6 }}
            >
              {subtitle.toUpperCase()}
            </AppText>
            {title && (
              <AppText
                variant="cardTitle"
                style={{ color: colors.textPrimary, fontSize: 18, marginTop: 1 }}
              >
                {title}
              </AppText>
            )}
          </View>
        )}
      </View>

      {/* Center title if no subtitle */}
      {!subtitle && title && (
        <View style={styles.centerCol}>
          <AppText variant="sectionHeading" style={{ color: colors.textPrimary }}>
            {title}
          </AppText>
        </View>
      )}

      {/* Right action / 6-dot menu from reference */}
      <View style={styles.rightCol}>
        {rightAction ? (
          rightAction
        ) : showMenu && onPressMenu ? (
          <TouchableOpacity
            onPress={onPressMenu}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.menuGridIcon}
          >
            {/* 6-dot 2x3 grid icon from reference top right */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    transform: [{ rotate: '180deg' }],
    padding: 4,
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
