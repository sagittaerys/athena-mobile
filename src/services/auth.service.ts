import { apiRequest, TokenStorage } from '@/shared/utils/api'
import type { AuthResponse, LoginPayload, RegisterPayload, VoiceProfile } from '@/shared/types/auth'

export const AuthService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await TokenStorage.setTokens(data.access_token, data.refresh_token)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await TokenStorage.setTokens(data.access_token, data.refresh_token)
    return data
  },

  async logout(): Promise<void> {
    const refreshToken = await TokenStorage.getRefreshToken()
    if (refreshToken) {
      await apiRequest('/api/v1/auth/logout', {
        method: 'DELETE',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => { })
    }
    await TokenStorage.clearTokens()
  },

  async getVoiceProfile(): Promise<VoiceProfile | null> {
    try {
      const data = await apiRequest<{ voice_profile: VoiceProfile | null }>('/api/v1/voice_profiles/current')
      return data.voice_profile
    } catch {
      return null
    }
  },

  async createVoiceProfile(audioUri: string): Promise<VoiceProfile> {
    const formData = new FormData()
    formData.append('audio_file', {
      uri: audioUri,
      name: 'sample.wav',
      type: 'audio/wav',
    } as any)

    const accessToken = await TokenStorage.getAccessToken()
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/voice_profiles`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error ?? 'Voice profile creation failed')
    }

    const data = await response.json()
    return data.voice_profile
  },
}