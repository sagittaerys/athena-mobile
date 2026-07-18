import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useThemeStore } from '@/features/settings/store/themeStore'
import { useTheme } from '@/shared/hooks/useTheme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { theme, scheme } = useTheme()
  const { checkAuth } = useAuthStore()
  const { loadMode } = useThemeStore()

  const [fontsLoaded, fontError] = useFonts({
    'CabinetGrotesk-Regular': require('../assets/fonts/CabinetGrotesk-Regular.otf'),
    'CabinetGrotesk-Medium': require('../assets/fonts/CabinetGrotesk-Medium.otf'),
    'CabinetGrotesk-Bold': require('../assets/fonts/CabinetGrotesk-Bold.otf'),
    'CabinetGrotesk-ExtraBold': require('../assets/fonts/CabinetGrotesk-Extrabold.otf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    checkAuth()
    loadMode()
  }, [])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="player"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="book/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reader/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </GestureHandlerRootView>
  )
}