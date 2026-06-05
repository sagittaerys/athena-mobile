export const Colors = {
  light: {
    background: '#F7F5F2',
    backgroundSecondary: '#EFEDE9',
    surface: '#FFFFFF',
    text: '#111111',
    textSecondary: '#555555',
    textTertiary: '#999999',
    border: '#E5E3DF',
    borderLight: '#F0EEE9',
    tabBar: 'rgba(247, 245, 242, 0.98)',
    tabBarBorder: 'rgba(0, 0, 0, 0.06)',
    tabBarActive: '#111111',
    tabBarInactive: 'rgba(0, 0, 0, 0.35)',
  },
  dark: {
    background: '#111111',
    backgroundSecondary: '#1A1A1A',
    surface: '#222222',
    text: '#F5F5F5',
    textSecondary: '#AAAAAA',
    textTertiary: '#666666',
    border: '#2A2A2A',
    borderLight: '#1F1F1F',
    tabBar: 'rgba(17, 17, 17, 0.98)',
    tabBarBorder: 'rgba(255, 255, 255, 0.06)',
    tabBarActive: '#F5F5F5',
    tabBarInactive: 'rgba(255, 255, 255, 0.35)',
  },
} as const

export type ColorScheme = 'light' | 'dark'
export type ThemeColors = typeof Colors.light
export type Theme = typeof Colors[keyof typeof Colors]