// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigator';
import { LogBox } from 'react-native';

// Optional: Ignore specific warnings if they are known and benign
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}