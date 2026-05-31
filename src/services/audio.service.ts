import { apiRequest, TokenStorage } from '@/shared/utils/api'
import type { AudioChunk } from '@/shared/types/audio'

interface AudioChunkResponse {
  audio_chunk: AudioChunk
}

export const AudioService = {
  async requestChunk(
    libraryItemId: number,
    chapterIndex: number,
    chunkIndex: number,
    text: string
  ): Promise<AudioChunk> {
    const data = await apiRequest<AudioChunkResponse>(
      `/api/v1/library_items/${libraryItemId}/audio_chunks`,
      {
        method: 'POST',
        body: JSON.stringify({
          chapter_index: chapterIndex,
          chunk_index: chunkIndex,
          text,
        }),
      }
    )
    return data.audio_chunk
  },

  async getChunkStatus(
    libraryItemId: number,
    chunkId: number
  ): Promise<AudioChunk> {
    const data = await apiRequest<AudioChunkResponse>(
      `/api/v1/library_items/${libraryItemId}/audio_chunks/${chunkId}`
    )
    return data.audio_chunk
  },

  getStreamUrl(libraryItemId: number, chunkId: number): string {
    const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
    return `${base}/api/v1/library_items/${libraryItemId}/audio_chunks/${chunkId}/stream`
  },

  async getStreamHeaders(): Promise<Record<string, string>> {
    const token = await TokenStorage.getAccessToken()
    return {
      Authorization: `Bearer ${token}`,
    }
  },

  // the polling happens here
  async pollUntilReady(
    libraryItemId: number,
    chunkId: number,
    intervalMs = 3000,
    maxAttempts = 40
  ): Promise<AudioChunk> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const chunk = await this.getChunkStatus(libraryItemId, chunkId)
      if (chunk.status === 'ready') return chunk
      if (chunk.status === 'failed') throw new Error('Audio generation failed')
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
    throw new Error('Audio generation timed out')
  },
}