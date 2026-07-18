import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'athena:theme-mode'

interface ThemeState {
  mode: ThemeMode
  hasLoaded: boolean
  setMode: (mode: ThemeMode) => void
  loadMode: () => Promise<void>
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  hasLoaded: false,

  setMode: (mode) => {
    set({ mode })
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {})
  },

  loadMode: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ mode: stored })
      }
    } catch {
      // falls back to system in this case
    } finally {
      set({ hasLoaded: true })
    }
  },
}))