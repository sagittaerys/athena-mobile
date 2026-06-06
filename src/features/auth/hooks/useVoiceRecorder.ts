import { useState, useRef, useCallback } from 'react'
import { useAudioRecorder, RecordingPresets } from 'expo-audio'

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setRecordingSeconds(0)
      await recorder.prepareToRecordAsync()
      recorder.record()
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          if (s >= 60) {
            stopRecording()
            return 60
          }
          return s + 1
        })
      }, 1000)
    } catch {
      setError('Microphone access denied. Please enable it in Settings.')
    }
  }, [recorder])

  const stopRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    try {
      const uri = await recorder.stop()
      setRecordingUri(uri as unknown as string)
    } catch {
      setError('Recording failed. Please try again.')
    }
  }, [recorder])

  const resetRecording = useCallback(() => {
    setRecordingUri(null)
    setRecordingSeconds(0)
    setError(null)
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return {
    isRecording,
    recordingUri,
    recordingSeconds,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime,
  }
}