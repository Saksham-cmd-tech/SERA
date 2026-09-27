import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { AddTransactionScreen } from '../screens/Transactions/AddTransactionScreen';
import { TransactionDetailScreen } from '../screens/Transactions/TransactionDetailScreen';
import { AnalyticsScreen } from '../screens/Analytics/AnalyticsScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  AddTransaction: { initialType?: 'expense' | 'income' | 'transfer'; initialCategoryId?: string } | undefined;
  TransactionDetail: { transactionId: string };
  Analytics: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
};
