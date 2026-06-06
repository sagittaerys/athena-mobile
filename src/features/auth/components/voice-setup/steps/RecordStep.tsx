import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { VoiceSetupWaveform } from '../VoiceSetupWaveform'

type Props = {
  theme: Theme
  isRecording: boolean
  recordingUri: string | null
  recordingSeconds: number
  error: string | null
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onSubmit: () => void
  formatTime: (s: number) => string
}

const PASSAGE = `"It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families..."`

export function RecordStep({
  theme,
  isRecording,
  recordingUri,
  recordingSeconds,
  error,
  onStart,
  onStop,
  onReset,
  onSubmit,
  formatTime,
}: Props) {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOut}
      style={styles.container}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        {isRecording ? 'Recording...' : recordingUri ? 'Recording complete.' : 'Your turn.'}
      </Text>

      {!recordingUri && (
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Read the passage below aloud. Tap the button when ready.
        </Text>
      )}

      {isRecording && (
        <Text style={[styles.timer, { color: theme.text }]}>
          {formatTime(recordingSeconds)} / 1:00
        </Text>
      )}

      <VoiceSetupWaveform isActive={isRecording} color={theme.text} mode="record" />

      {!recordingUri && (
        <View style={[styles.passageCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <Text style={[styles.passageText, { color: theme.textSecondary }]}>
            {PASSAGE}
          </Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!recordingUri ? (
        <Pressable
          style={[styles.recordButton, { backgroundColor: isRecording ? '#FF3B30' : theme.text }]}
          onPress={isRecording ? onStop : onStart}
        >
          <Text style={[styles.recordButtonText, { color: isRecording ? '#FFFFFF' : theme.background }]}>
            {isRecording ? '⏹  Stop recording' : '⏺  Start recording'}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.doneActions}>
          <Pressable
            style={[styles.retryButton, { borderColor: theme.border }]}
            onPress={onReset}
          >
            <Text style={[styles.retryText, { color: theme.textSecondary }]}>Re-record</Text>
          </Pressable>
          <Pressable
            style={[styles.continueButton, { backgroundColor: theme.text }]}
            onPress={onSubmit}
          >
            <Text style={[styles.continueText, { color: theme.background }]}>Use this recording</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * 1.15,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.65,
  },
  timer: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
    textAlign: 'center',
  },
  passageCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  passageText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.75,
    fontStyle: 'italic',
  },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#FF3B30',
    textAlign: 'center',
  },
  recordButton: {
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
  doneActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  retryButton: {
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  continueButton: {
    height: 56,
    borderRadius: Radius.full,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
})