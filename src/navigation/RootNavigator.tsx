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
  const settings = useSettingsStore(state => state.settings);
  const isLoading = useSettingsStore(state => state.isLoading);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!settings.hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding">
          {props => (
            <OnboardingScreen
              {...props}
              onComplete={() => props.navigation.replace('Main')}
            />
          )}
        </Stack.Screen>
      ) : null}
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};
