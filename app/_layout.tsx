import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../src/theme';
import { registerForNotifications, registerBackgroundFetch } from '../src/notifications';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      await registerForNotifications();
      await registerBackgroundFetch();
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      />
    </SafeAreaProvider>
  );
}
