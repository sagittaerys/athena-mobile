import { useState, useCallback, useRef } from 'react'
import { useAudioPlayer } from 'expo-audio'

const DEMO_AUDIO_URI = require('../../../../assets/audio/demo-voice.wav')

export function useDemoPlayer() {
  const player = useAudioPlayer(DEMO_AUDIO_URI)
  const [isPlaying, setIsPlaying] = useState(false)
  const isReleased = useRef(false)

  const play = useCallback(async () => {
    if (isReleased.current) return
    try {
      setIsPlaying(true)
      player.play()
      player.addListener('playbackStatusUpdate', status => {
        if (status.didJustFinish) {
          setIsPlaying(false)
        }
      })
    } catch {
      setIsPlaying(false)
    }
  }, [player])

  const stop = useCallback(() => {
    if (isReleased.current) return
    player.pause()
    setIsPlaying(false)
  }, [player])

  const cleanup = useCallback(() => {
    if (isReleased.current) return
    isReleased.current = true
    try {
      player.remove()
    } catch {

    }
  }, [player])

  return { isPlaying, play, stop, cleanup }
}