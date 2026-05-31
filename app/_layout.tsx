import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useColorScheme } from 'react-native'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Colors } from '@/shared/constants/colors'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const scheme = (colorScheme as keyof typeof Colors) ?? 'light'
  const theme = Colors[scheme]
  const { checkAuth } = useAuthStore()

  const [fontsLoaded, fontError] = useFonts({
    'CabinetGrotesk-Regular': require('../assets/fonts/CabinetGrotesk-Regular.otf'),
    'CabinetGrotesk-Medium': require('../assets/fonts/CabinetGrotesk-Medium.otf'),
    'CabinetGrotesk-Bold': require('../assets/fonts/CabinetGrotesk-Bold.otf'),
    'CabinetGrotesk-ExtraBold': require('../assets/fonts/CabinetGrotesk-ExtraBold.otf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    checkAuth()
  }, [])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  )
}