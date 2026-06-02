import { Redirect } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function Index() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }

  return <Redirect href="/(auth)/welcome" />
}