import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AgroTheme } from '../src/theme/theme';
import '../src/i18n';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={AgroTheme}>
        <StatusBar style="light" backgroundColor="#1B5E20" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
