import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Colors } from '@/shared/constants/colors'

export default function AuthLayout() {
  const colorScheme = useColorScheme()
  const scheme = (colorScheme as keyof typeof Colors) ?? 'light'
  const theme = Colors[scheme]

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    />
  )
}