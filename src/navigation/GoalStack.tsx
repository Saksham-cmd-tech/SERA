import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoalsScreen } from '../screens/Goals/GoalsScreen';
import { CreateGoalScreen } from '../screens/Goals/CreateGoalScreen';

export type GoalStackParamList = {
  GoalsMain: undefined;
  CreateGoal: undefined;
};

const Stack = createNativeStackNavigator<GoalStackParamList>();

export const GoalStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalsMain" component={GoalsScreen} />
      <Stack.Screen name="CreateGoal" component={CreateGoalScreen} />
    </Stack.Navigator>
  );
};
