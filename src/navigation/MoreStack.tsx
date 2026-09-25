import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { AccountsScreen } from '../screens/Accounts/AccountsScreen';
import { TransferScreen } from '../screens/Accounts/TransferScreen';
import { AnalyticsScreen } from '../screens/Analytics/AnalyticsScreen';
import { ReportsScreen } from '../screens/Settings/ReportsScreen';
import { SubscriptionsScreen } from '../screens/Settings/SubscriptionsScreen';

export type MoreStackParamList = {
  Settings: undefined;
  Accounts: undefined;
  Transfer: { defaultFromId?: string } | undefined;
  Analytics: undefined;
  Reports: undefined;
  Subscriptions: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export const MoreStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Accounts" component={AccountsScreen} />
      <Stack.Screen name="Transfer" component={TransferScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
    </Stack.Navigator>
  );
};
