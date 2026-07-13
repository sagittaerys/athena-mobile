import { useEffect, useRef, useCallback } from 'react'
import { useAudioPlayer as useExpoAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { AudioService } from '@/services/audio.service'
import type { EpubChunk } from '@/shared/types/book'

const PRELOAD_AHEAD = 2 

export function useAudioPlayer() {
  const {
    libraryItemId,
    currentChapterIndex,
    currentChunkIndex,
    speed,
    isPlaying,
    status,
    setStatus,
    setPlaying,
    setPosition,
    setDuration,
    setChunk,
    setError,
    nextChunk,
    reset,
  } = usePlayerStore()

  const { getChapters } = useLibraryStore()
  // const { voiceProfile } = useAuthStore()

  
  const player = useExpoAudioPlayer(null)
  const playerStatus = useAudioPlayerStatus(player)

 
  const requestedChunks = useRef<Set<string>>(new Set())
  const chunkAudioIds = useRef<Map<string, number>>(new Map())
  const isLoadingChunk = useRef(false)

  const chunkKey = (chapterIdx: number, chunkIdx: number) =>
    `${chapterIdx}-${chunkIdx}`

  // to sync position and duration from expo-audio status
  useEffect(() => {
    if (playerStatus.currentTime !== undefined) {
      setPosition(playerStatus.currentTime)
    }
    if (playerStatus.duration !== undefined && playerStatus.duration > 0) {
      setDuration(playerStatus.duration)
    }
  }, [playerStatus.currentTime, playerStatus.duration])

  // next detection
  useEffect(() => {
    if (playerStatus.didJustFinish) {
      handleChunkFinished()
    }
  }, [playerStatus.didJustFinish])

  // sync playback speed
  useEffect(() => {
    if (player) {
      player.setPlaybackRate(speed)
    }
  }, [speed, player])

  // sync isPlaying state with expo-audio player
  useEffect(() => {
    if (!player) return
    if (isPlaying && !playerStatus.playing) {
      player.play()
    } else if (!isPlaying && playerStatus.playing) {
      player.pause()
    }
  }, [isPlaying])

 
  useEffect(() => {
    if (!libraryItemId || status === 'idle') return
    loadCurrentChunk()
    preloadAheadChunks()
  }, [libraryItemId, currentChapterIndex, currentChunkIndex])

  
  const loadCurrentChunk = useCallback(async () => {
    if (!libraryItemId || isLoadingChunk.current) return

    const chapters = getChapters(libraryItemId)
    const chapter = chapters[currentChapterIndex]
    if (!chapter) return

    const chunk = chapter.chunks[currentChunkIndex]
    if (!chunk) {
      // next
      handleEndOfChapter()
      return
    }

    const key = chunkKey(currentChapterIndex, currentChunkIndex)
    isLoadingChunk.current = true
    setStatus('loading')

    try {
      const audioChunkId = await ensureChunkReady(libraryItemId, chunk, currentChapterIndex, currentChunkIndex)
      if (!audioChunkId) throw new Error('Chunk generation failed')

      chunkAudioIds.current.set(key, audioChunkId)

      const streamUrl = AudioService.getStreamUrl(libraryItemId, audioChunkId)
      const headers = await AudioService.getStreamHeaders()

      // load into expo-audio player
      await player.replace({
        uri: streamUrl,
        headers,
      })

      player.setPlaybackRate(speed)
      player.play()
      setStatus('playing')
      setChunk(currentChapterIndex, currentChunkIndex, audioChunkId)

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Playback failed')
    } finally {
      isLoadingChunk.current = false
    }
  }, [libraryItemId, currentChapterIndex, currentChunkIndex, speed])

  
  const ensureChunkReady = async (
    libraryItemId: number,
    chunk: EpubChunk,
    chapterIndex: number,
    chunkIndex: number
  ): Promise<number | null> => {
    const key = chunkKey(chapterIndex, chunkIndex)

    
    if (chunkAudioIds.current.has(key)) {
      return chunkAudioIds.current.get(key) ?? null
    }

    
    const audioChunk = await AudioService.requestChunk(
      libraryItemId,
      chapterIndex,
      chunkIndex,
      chunk.text
    )

    if (audioChunk.status === 'ready') {
      return audioChunk.id
    }

   
    const ready = await AudioService.pollUntilReady(
      libraryItemId,
      audioChunk.id,
      3000,
      40
    )

    return ready.id
  }

  
  const preloadAheadChunks = useCallback(async () => {
    if (!libraryItemId) return

    const chapters = getChapters(libraryItemId)
    const chapter = chapters[currentChapterIndex]
    if (!chapter) return

    for (let i = 1; i <= PRELOAD_AHEAD; i++) {
      const nextIdx = currentChunkIndex + i
      if (nextIdx >= chapter.chunks.length) break

      const key = chunkKey(currentChapterIndex, nextIdx)
      if (requestedChunks.current.has(key)) continue

      requestedChunks.current.add(key)
      const chunk = chapter.chunks[nextIdx]

      // Fire and forget — don't await
      AudioService.requestChunk(
        libraryItemId,
        currentChapterIndex,
        nextIdx,
        chunk.text
      ).catch(() => {
        requestedChunks.current.delete(key)
      })
    }
  }, [libraryItemId, currentChapterIndex, currentChunkIndex])

  
  const handleChunkFinished = useCallback(() => {
    if (!libraryItemId) return

    const chapters = getChapters(libraryItemId)
    const chapter = chapters[currentChapterIndex]
    if (!chapter) return

    const isLastChunk = currentChunkIndex >= chapter.chunks.length - 1
    const isLastChapter = currentChapterIndex >= chapters.length - 1

    if (!isLastChunk) {
      nextChunk()
    } else if (!isLastChapter) {
    
      usePlayerStore.setState({
        currentChapterIndex: currentChapterIndex + 1,
        currentChunkIndex: 0,
        positionSeconds: 0,
      })
    } else {
    
      setStatus('idle')
      setPlaying(false)
    }
  }, [libraryItemId, currentChapterIndex, currentChunkIndex])

  const handleEndOfChapter = useCallback(() => {
    if (!libraryItemId) return
    const chapters = getChapters(libraryItemId)
    const isLastChapter = currentChapterIndex >= chapters.length - 1

    if (!isLastChapter) {
      usePlayerStore.setState({
        currentChapterIndex: currentChapterIndex + 1,
        currentChunkIndex: 0,
        positionSeconds: 0,
      })
    } else {
      setStatus('idle')
      setPlaying(false)
    }
  }, [libraryItemId, currentChapterIndex])

  
  const playPause = useCallback(() => {
    if (isPlaying) {
      player.pause()
      setPlaying(false)
    } else {
      player.play()
      setPlaying(true)
    }
  }, [isPlaying, player])

  const skipForward = useCallback(() => {
    if (!player || !playerStatus.duration) return
    const newPosition = Math.min(
      (playerStatus.currentTime ?? 0) + 10,
      playerStatus.duration
    )
    player.seekTo(newPosition)
    setPosition(newPosition)
  }, [player, playerStatus])

  const skipBack = useCallback(() => {
    if (!player) return
    const newPosition = Math.max((playerStatus.currentTime ?? 0) - 10, 0)
    player.seekTo(newPosition)
    setPosition(newPosition)
  }, [player, playerStatus])

  const skipToChapter = useCallback((chapterIndex: number) => {
    usePlayerStore.setState({
      currentChapterIndex: chapterIndex,
      currentChunkIndex: 0,
      positionSeconds: 0,
    })
  }, [])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      player.remove()
    }
  }, [])

  return {
    playPause,
    skipForward,
    skipBack,
    skipToChapter,
    player,
    playerStatus,
  }
}