import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer, DarkTheme, Theme} from '@react-navigation/native';
import RootTabs from './navigation/RootTabs';
import {theme} from './src/theme';
import {initNotifications, registerBackgroundFetch} from './src/notifications';

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.surface,
    border: theme.colors.border,
    primary: theme.colors.primary,
    text: theme.colors.text,
  },
};

export default function App() {
  useEffect(() => {
    initNotifications();
    registerBackgroundFetch();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <NavigationContainer theme={navTheme}>
        <RootTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
