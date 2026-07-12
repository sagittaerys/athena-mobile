import { create } from 'zustand'
import type { PlaybackSpeed } from '@/shared/types/audio'

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface PlayerStore {

  libraryItemId: number | null
  currentChapterIndex: number
  currentChunkIndex: number
  currentChunkId: number | null
  positionSeconds: number
  durationSeconds: number
  speed: PlaybackSpeed
  status: PlayerStatus
  isVisible: boolean
  isPlaying: boolean
  error: string | null

  
  chunkQueue: number[]


  openPlayer: (libraryItemId: number) => void
  closePlayer: () => void
  setPlaying: (isPlaying: boolean) => void
  setStatus: (status: PlayerStatus) => void
  setPosition: (seconds: number) => void
  setDuration: (seconds: number) => void
  setSpeed: (speed: PlaybackSpeed) => void
  setChunk: (chapterIndex: number, chunkIndex: number, chunkId: number) => void
  setChunkQueue: (queue: number[]) => void
  setError: (error: string | null) => void
  nextChunk: () => void
  reset: () => void
}

const initialState = {
  libraryItemId: null,
  currentChapterIndex: 0,
  currentChunkIndex: 0,
  currentChunkId: null,
  positionSeconds: 0,
  durationSeconds: 0,
  speed: 1 as PlaybackSpeed,
  status: 'idle' as PlayerStatus,
  isVisible: false,
  isPlaying: false,
  error: null,
  chunkQueue: [],
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,

  openPlayer: (libraryItemId) =>
    set({
      libraryItemId,
      isVisible: true,
      status: 'loading',
      currentChapterIndex: 0,
      currentChunkIndex: 0,
      currentChunkId: null,
      positionSeconds: 0,
      error: null,
    }),

  closePlayer: () => set({ isVisible: false, isPlaying: false, status: 'idle' }),

  setPlaying: (isPlaying) => set({ isPlaying }),

  setStatus: (status) => set({
    status,
    isPlaying: status === 'playing',
  }),

  setPosition: (positionSeconds) => set({ positionSeconds }),
  setDuration: (durationSeconds) => set({ durationSeconds }),
  setSpeed: (speed) => set({ speed }),

  setChunk: (currentChapterIndex, currentChunkIndex, currentChunkId) =>
    set({ currentChapterIndex, currentChunkIndex, currentChunkId }),

  setChunkQueue: (chunkQueue) => set({ chunkQueue }),

  setError: (error) => set({ error, status: 'error', isPlaying: false }),

  nextChunk: () => {
    const { currentChunkIndex, currentChapterIndex } = get()
    set({
      currentChunkIndex: currentChunkIndex + 1,
      positionSeconds: 0,
    })
  },

  reset: () => set(initialState),
}))