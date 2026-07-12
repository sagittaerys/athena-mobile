import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Library, Compass, CircleUserRound } from 'lucide-react-native'
import { Colors, Theme } from '@/shared/constants/colors'

export function IOSNativeTabLayout() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size }) => <CircleUserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}