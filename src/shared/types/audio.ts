export type AudioChunkStatus = 'pending' | 'ready' | 'failed'

export interface AudioChunk {
  id: number
  chapter_index: number
  chunk_index: number
  audio_url: string | null
  status: AudioChunkStatus
}

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5 | 2

export interface PlayerState {
  isPlaying: boolean
  currentChapterIndex: number
  currentChunkIndex: number
  positionSeconds: number
  speed: PlaybackSpeed
  libraryItemId: number | null
}