import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BudgetsScreen } from '../screens/Budgets/BudgetsScreen';
import { AddBudgetCategoryScreen } from '../screens/Budgets/AddBudgetCategoryScreen';

export type BudgetStackParamList = {
  BudgetsMain: undefined;
  AddBudgetCategory: undefined;
};

const Stack = createNativeStackNavigator<BudgetStackParamList>();

export const BudgetStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BudgetsMain" component={BudgetsScreen} />
      <Stack.Screen name="AddBudgetCategory" component={AddBudgetCategoryScreen} />
    </Stack.Navigator>
  );
};
