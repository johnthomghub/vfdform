import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../src/constants';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.panel },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen
          name="report/[id]"
          options={{
            title: 'Incident Report',
            headerBackTitle: 'Reports',
            presentation: 'card',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
