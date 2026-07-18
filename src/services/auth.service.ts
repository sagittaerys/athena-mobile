import { File, UploadType } from 'expo-file-system'
import { apiRequest, TokenStorage } from '@/shared/utils/api'
import type { User, AuthResponse, LoginPayload, RegisterPayload, VoiceProfile } from '@/shared/types/auth'

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

  async getCurrentUser(): Promise<User> {
    const data = await apiRequest<{ user: User }>('/api/v1/auth/me')
    return data.user
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
    const accessToken = await TokenStorage.getAccessToken()
    const file = new File(audioUri)

    const task = file.createUploadTask(
      `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/voice_profiles`,
      {
        uploadType: UploadType.MULTIPART,
        fieldName: 'audio_file',
        mimeType: 'audio/wav',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const result = await task.uploadAsync()

    if (!result || result.status < 200 || result.status >= 300) {
      const parsed = result?.body ? JSON.parse(result.body) : {}
      throw new Error(parsed.error ?? 'Voice profile creation failed')
    }

    const data = JSON.parse(result.body)
    return data.voice_profile
  },
}