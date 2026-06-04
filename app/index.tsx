import { Redirect } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View } from 'react-native'
import { ONBOARDING_KEY } from '@/shared/constants/onboarding'


export default function Index() {
  const { isAuthenticated } = useAuthStore()
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)

  useEffect(() => {
      AsyncStorage.getItem(ONBOARDING_KEY).then(value => {
        setOnboardingComplete(value === 'true')
      })
  }, [])

  if (onboardingComplete === null) {
    return <View />
  }

  if (!onboardingComplete) {
    return <Redirect href="/(auth)/onboarding" />
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }

  return <Redirect href="/(auth)/welcome" />
}