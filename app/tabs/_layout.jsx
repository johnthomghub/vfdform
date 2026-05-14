import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.panel, borderTopColor: COLORS.divider, height: 62, paddingBottom: 8 },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="reports"
        options={{ title: 'Reports', tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="about"
        options={{ title: 'About', tabBarIcon: ({ color, size }) => <Ionicons name="shield-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
