import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type React from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface TabBarIconProps {
  color: string;
  focused: boolean;
  name: IoniconName;
  size: number;
}

function TabBarIcon({ color, focused, name, size }: TabBarIconProps): React.JSX.Element {
  return <Ionicons color={color} name={name} size={focused ? size + 2 : size} />;
}

export default function TabLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          borderTopColor: '#E5E7EB',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              color={color}
              focused={focused}
              name={focused ? 'home' : 'home-outline'}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: 'Video',
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              color={color}
              focused={focused}
              name={focused ? 'play-circle' : 'play-circle-outline'}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
