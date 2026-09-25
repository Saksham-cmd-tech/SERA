import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransactionsScreen } from '../screens/Transactions/TransactionsScreen';
import { AddTransactionScreen } from '../screens/Transactions/AddTransactionScreen';
import { TransactionDetailScreen } from '../screens/Transactions/TransactionDetailScreen';

export type TransactionStackParamList = {
  TransactionsMain: undefined;
  AddTransaction: { initialType?: 'expense' | 'income' | 'transfer'; initialCategoryId?: string } | undefined;
  TransactionDetail: { transactionId: string };
};

const Stack = createNativeStackNavigator<TransactionStackParamList>();

export const TransactionStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransactionsMain" component={TransactionsScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </Stack.Navigator>
  );
};
