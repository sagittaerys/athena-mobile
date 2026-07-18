import { useColorScheme } from 'react-native'
import { useThemeStore } from '@/features/settings/store/themeStore'
import { Colors, Theme } from '@/shared/constants/colors'

export function useTheme(): { theme: Theme; scheme: 'light' | 'dark' } {
  const systemScheme = useColorScheme()
  const mode = useThemeStore(state => state.mode)

  const scheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode

  return { theme: Colors[scheme], scheme }
}