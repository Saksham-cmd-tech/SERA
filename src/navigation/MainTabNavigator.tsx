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
    { name: 'HomeTab', label: 'Home', icon: 'Home' },
    { name: 'TransactionsTab', label: 'History', icon: 'Receipt' },
    { name: 'BudgetsTab', label: 'Budget', icon: 'SlidersHorizontal' },
    { name: 'GoalsTab', label: 'Goals', icon: 'Shield' },
    { name: 'MoreTab', label: 'More', icon: 'Menu' },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          paddingBottom: Math.max(insets.bottom + 4, 14),
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
            <View style={styles.iconWrap}>
              <CategoryIcon
                name={item.icon}
                size={22}
                color={isFocused ? colors.accentRed : colors.textMuted}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
              <AppText
                variant="labelSmall"
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.accentRed : colors.textMuted,
                    fontWeight: isFocused ? '600' : '500',
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
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 3,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
