import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { useSettingsStore } from '../store/useSettingsStore';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();


export const RootNavigator: React.FC = () => {
  const hasCompletedOnboarding = useSettingsStore(
    state => state.settings?.hasCompletedOnboarding ?? false
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding">
          {props => <OnboardingScreen {...props} onComplete={() => {}} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

