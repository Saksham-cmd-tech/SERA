import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppText } from '../components/common/AppText';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { HomeStack } from './HomeStack';
import { TransactionStack } from './TransactionStack';
import { BudgetStack } from './BudgetStack';
import { GoalStack } from './GoalStack';
import { MoreStack } from './MoreStack';

export type MainTabParamList = {
  HomeTab: undefined;
  TransactionsTab: undefined;
  BudgetsTab: undefined;
  GoalsTab: undefined;
  MoreTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const tabsConfig = [
    { name: 'HomeTab', label: 'HOME', icon: 'Home' },
    { name: 'TransactionsTab', label: 'HISTORY', icon: 'Receipt' },
    { name: 'BudgetsTab', label: 'BUDGET', icon: 'SlidersHorizontal' },
    { name: 'GoalsTab', label: 'GOALS', icon: 'Shield' },
    { name: 'MoreTab', label: 'MORE', icon: 'Menu' },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom + 6, 16),
        },
      ]}
    >
      {tabsConfig.map((item, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(item.name);
          }
        };

        return (
          <TouchableOpacity
            key={item.name}
            activeOpacity={0.7}
            onPress={onPress}
            style={styles.tabButton}
          >
            {/* Subtle top indicator bar from requirement 6 */}
            <View
              style={[
                styles.activeIndicator,
                {
                  backgroundColor: isFocused ? colors.textPrimary : 'transparent',
                },
              ]}
            />

            <View style={styles.iconWrap}>
              <CategoryIcon
                name={item.icon}
                size={20}
                color={isFocused ? colors.textPrimary : colors.textMuted}
                strokeWidth={isFocused ? 2.2 : 1.6}
              />
              <AppText
                variant="labelSmall"
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.textPrimary : colors.textMuted,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </AppText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="TransactionsTab" component={TransactionStack} />
      <Tab.Screen name="BudgetsTab" component={BudgetStack} />
      <Tab.Screen name="GoalsTab" component={GoalStack} />
      <Tab.Screen name="MoreTab" component={MoreStack} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 20,
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 9,
    letterSpacing: 1.2,
  },
});
