import { useState, useCallback } from 'react'
import { useAudioPlayer } from 'expo-audio'

const DEMO_AUDIO_URI = require('../../../../assets/audio/demo-voice.wav')

export function useDemoPlayer() {
  const player = useAudioPlayer(DEMO_AUDIO_URI)
  const [isPlaying, setIsPlaying] = useState(false)

  const play = useCallback(async () => {
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
    player.pause()
    setIsPlaying(false)
  }, [player])

  const cleanup = useCallback(() => {
    player.remove()
  }, [player])

  return { isPlaying, play, stop, cleanup }
}