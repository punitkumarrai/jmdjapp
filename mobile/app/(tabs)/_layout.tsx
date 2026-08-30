import { Tabs } from 'expo-router';
import { theme } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.bgWarm,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.family.serif,
          fontSize: theme.typography.sizes.h1,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: theme.typography.family.sansMedium,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Rates',
          tabBarIcon: ({ color }) => <Ionicons name="pricetags" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color }) => <Ionicons name="calculator" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
