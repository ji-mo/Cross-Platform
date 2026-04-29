import { Stack } from 'expo-router';
import type React from 'react';

export default function RootLayout(): React.JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="videoPage" options={{ headerShown: false }} />
    </Stack>
  );
}
