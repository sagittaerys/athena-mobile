import { create } from 'zustand'
import { AuthService } from '@/services/auth.service'
import { TokenStorage } from '@/shared/utils/api'
import type { User, LoginPayload, RegisterPayload, VoiceProfile } from '@/shared/types/auth'

interface AuthState {
  user: User | null
  voiceProfile: VoiceProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  setVoiceProfile: (profile: VoiceProfile) => void
  clearError: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  voiceProfile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const data = await AuthService.login(payload)
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const data = await AuthService.register(payload)
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: async () => {
    await AuthService.logout()
    set({
      user: null,
      voiceProfile: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setVoiceProfile: (profile) => set({ voiceProfile: profile }),

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    const token = await TokenStorage.getAccessToken()
    if (!token) {
      set({ isAuthenticated: false })
      return
    }
    try {
      const voiceProfile = await AuthService.getVoiceProfile()
      set({ isAuthenticated: true, voiceProfile })
    } catch {
      set({ isAuthenticated: false })
    }
  },
}))