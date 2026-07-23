import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: 'rgba(255,255,255,0.08)' },
        tabBarActiveTintColor: Colors.accentLime,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontFamily: Fonts.mono, fontSize: 10, letterSpacing: 1 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Garage',
          tabBarLabel: ({ color }) => <Text style={{ color, fontFamily: Fonts.mono, fontSize: 10 }}>GARAGE</Text>,
        }}
      />
      <Tabs.Screen
        name="mi-garaje"
        options={{
          title: 'Mi Garaje',
          tabBarLabel: ({ color }) => <Text style={{ color, fontFamily: Fonts.mono, fontSize: 10 }}>MI GARAJE</Text>,
        }}
      />
    </Tabs>
  );
}
