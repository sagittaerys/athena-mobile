import { Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { AndroidTabBar } from '@/shared/components/TabBar/AndroidTabBar'
import { useTheme } from '@/shared/hooks/useTheme'

export default function TabsLayout() {
 const { theme } = useTheme()

//  iOS 26+ gets native tab bar with liquid glass effect
  if (Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 26) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
        tabBar={() => null}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="me" />
      </Tabs>
    )
  }

  // android gets animated custom tab bar
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <AndroidTabBar {...props} theme={theme} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarLabel: 'Library',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarLabel: 'Discover',
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          tabBarLabel: 'Me',
        }}
      />
    </Tabs>
  )
}
