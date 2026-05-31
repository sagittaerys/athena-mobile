import { create } from 'zustand'
import type { PlayerState, PlaybackSpeed } from '@/shared/types/audio'

interface PlayerStore extends PlayerState {
  isVisible: boolean

  setPlaying: (isPlaying: boolean) => void
  setPosition: (seconds: number) => void
  setSpeed: (speed: PlaybackSpeed) => void
  setChunk: (chapterIndex: number, chunkIndex: number) => void
  openPlayer: (libraryItemId: number) => void
  closePlayer: () => void
  reset: () => void
}

const initialState: PlayerState = {
  isPlaying: false,
  currentChapterIndex: 0,
  currentChunkIndex: 0,
  positionSeconds: 0,
  speed: 1,
  libraryItemId: null,
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...initialState,
  isVisible: false,

  setPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (positionSeconds) => set({ positionSeconds }),
  setSpeed: (speed) => set({ speed }),
  setChunk: (currentChapterIndex, currentChunkIndex) =>
    set({ currentChapterIndex, currentChunkIndex }),

  openPlayer: (libraryItemId) =>
    set({ libraryItemId, isVisible: true, isPlaying: false }),

  closePlayer: () => set({ isVisible: false, isPlaying: false }),

  reset: () => set({ ...initialState, isVisible: false }),
}))