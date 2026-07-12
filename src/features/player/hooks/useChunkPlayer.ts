import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { LibraryService } from '@/services/books.service'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { usePlayerStore } from '@/features/player/store/playerStore'
import type { AudioChunk } from '@/shared/types/audio'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 60000

interface FlatChunk {
  chapterIndex: number
  chunkIndex: number
  text: string
}

export function useChunkPlayer(libraryItemId: number | null) {
  const { getChapters } = useLibraryStore()
  const {
    currentChapterIndex,
    currentChunkIndex,
    setChunk,
    setPlaying,
    setStatus,
    setPosition,
    setDuration,
    setChunkQueue,
    setError,
  } = usePlayerStore()

  const player = useAudioPlayer()
  const chunkCache = useRef<Map<string, AudioChunk>>(new Map())
  const pollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())
  const loadedChunkId = useRef<number | null>(null)

  const flatChunks = useMemo<FlatChunk[]>(() => {
    if (!libraryItemId) return []
    const chapters = getChapters(libraryItemId)
    return chapters.flatMap(chapter =>
      chapter.chunks.map(chunk => ({
        chapterIndex: chapter.chapter_index,
        chunkIndex: chunk.chunk_index,
        text: chunk.text,
      }))
    )
  }, [libraryItemId, getChapters])

  const keyFor = (chapterIndex: number, chunkIndex: number) => `${chapterIndex}:${chunkIndex}`

  const currentFlatIndex = flatChunks.findIndex(
    c => c.chapterIndex === currentChapterIndex && c.chunkIndex === currentChunkIndex
  )

  // Request + poll a single chunk's audio, resolving once ready/failed
  const ensureChunkReady = useCallback(
    (flat: FlatChunk): Promise<AudioChunk> => {
      if (!libraryItemId) return Promise.reject(new Error('No library item'))
      const key = keyFor(flat.chapterIndex, flat.chunkIndex)
      const cached = chunkCache.current.get(key)
      if (cached?.status === 'ready') return Promise.resolve(cached)

      return new Promise((resolve, reject) => {
        const start = async () => {
          try {
            let chunk =
              cached ??
              (await LibraryService.requestAudioChunk(
                libraryItemId,
                flat.chapterIndex,
                flat.chunkIndex,
                flat.text
              ))
            chunkCache.current.set(key, chunk)
            setChunkQueue([...usePlayerStore.getState().chunkQueue, chunk.id])

            if (chunk.status === 'ready') {
              resolve(chunk)
              return
            }
            if (chunk.status === 'failed') {
              reject(new Error('Audio synthesis failed'))
              return
            }

            const startedAt = Date.now()
            const timer = setInterval(async () => {
              try {
                if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
                  clearInterval(timer)
                  pollTimers.current.delete(key)
                  reject(new Error('Timed out waiting for audio'))
                  return
                }
                const updated = await LibraryService.getAudioChunk(libraryItemId, chunk.id)
                chunkCache.current.set(key, updated)
                if (updated.status === 'ready') {
                  clearInterval(timer)
                  pollTimers.current.delete(key)
                  resolve(updated)
                } else if (updated.status === 'failed') {
                  clearInterval(timer)
                  pollTimers.current.delete(key)
                  reject(new Error('Audio synthesis failed'))
                }
              } catch (e) {
                clearInterval(timer)
                pollTimers.current.delete(key)
                reject(e as Error)
              }
            }, POLL_INTERVAL_MS)
            pollTimers.current.set(key, timer)
          } catch (e) {
            reject(e as Error)
          }
        }
        start()
      })
    },
    [libraryItemId, setChunkQueue]
  )

  // Load and play a given flat-index chunk
  const loadAndPlay = useCallback(
    async (flatIndex: number) => {
      const flat = flatChunks[flatIndex]
      if (!flat || !libraryItemId) return

      setStatus('loading')
      try {
        const chunk = await ensureChunkReady(flat)
        setChunk(chunk.chapter_index, chunk.chunk_index, chunk.id)

        const uri = LibraryService.streamUrl(libraryItemId, chunk.id)
        player.replace({ uri }) // NOTE: verify against expo-audio's actual API if this errors
        loadedChunkId.current = chunk.id
        player.play()
        setPlaying(true)
        setStatus('playing')

        // Prefetch next chunk in the background, don't block on it
        const next = flatChunks[flatIndex + 1]
        if (next) ensureChunkReady(next).catch(() => {})
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Playback failed')
      }
    },
    [flatChunks, libraryItemId, ensureChunkReady, player, setChunk, setPlaying, setStatus, setError]
  )

  // Advance to the next chunk in sequence
  const advance = useCallback(() => {
    const next = currentFlatIndex + 1
    if (next < flatChunks.length) {
      loadAndPlay(next)
    } else {
      setPlaying(false)
      setStatus('idle')
    }
  }, [currentFlatIndex, flatChunks, loadAndPlay, setPlaying, setStatus])

  // Listen for playback progress / completion
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', status => {
      if (status.currentTime != null) setPosition(status.currentTime)
      if (status.duration != null) setDuration(status.duration)
      if (status.didJustFinish) advance()
    })
    return () => sub.remove()
  }, [player, advance, setPosition, setDuration])

  // Kick off playback of the current position when the queue is ready
  useEffect(() => {
    if (currentFlatIndex === 0 && loadedChunkId.current === null && flatChunks.length > 0) {
      loadAndPlay(0)
    }
  }, [currentFlatIndex, flatChunks, loadAndPlay])

  // Clean up any in-flight polls on unmount
  useEffect(() => {
    return () => {
      pollTimers.current.forEach(timer => clearInterval(timer))
      pollTimers.current.clear()
      player.remove()
    }
  }, [player])

  const togglePlay = useCallback(() => {
    const { isPlaying } = usePlayerStore.getState()
    if (isPlaying) {
      player.pause()
      setPlaying(false)
    } else {
      player.play()
      setPlaying(true)
    }
  }, [player, setPlaying])

  const skipNext = useCallback(() => advance(), [advance])

  const skipPrevious = useCallback(() => {
    const prev = currentFlatIndex - 1
    if (prev >= 0) loadAndPlay(prev)
  }, [currentFlatIndex, loadAndPlay])

  return {
    togglePlay,
    skipNext,
    skipPrevious,
    totalChunks: flatChunks.length,
    currentFlatIndex,
  }
}