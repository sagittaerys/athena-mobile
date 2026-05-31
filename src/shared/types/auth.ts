export interface User {
  id: number
  email: string
  username: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
}

export interface VoiceProfile {
  id: number
  status: 'pending' | 'ready' | 'failed'
  kokoro_profile_id: string | null
  created_at: string
}