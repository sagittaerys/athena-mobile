import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

const ACCESS_TOKEN_KEY = 'athena_access_token'
const REFRESH_TOKEN_KEY = 'athena_refresh_token'

export const TokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setTokens: async (access: string, refresh: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access)
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh)
  },
  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  },
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await TokenStorage.getRefreshToken()
  if (!refreshToken) return null

  const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    await TokenStorage.clearTokens()
    return null
  }

  const data = await response.json()
  await TokenStorage.setTokens(data.access_token, data.refresh_token)
  return data.access_token
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const accessToken = await TokenStorage.getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiRequest<T>(endpoint, options, false)
    }
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error ?? `Request failed: ${response.status}`)
  }

  return response.json()
}