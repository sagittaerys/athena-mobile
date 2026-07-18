import { useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { useState } from 'react'
import { AudioModule } from 'expo-audio'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useVoiceRecorder } from '@/features/auth/hooks/useVoiceRecorder'
import { useDemoPlayer } from '@/features/auth/hooks/useDemoPlayer'
import { VoiceSetupStepIndicator } from '@/features/auth/components/voice-setup/VoiceSetupStepIndicator'
import { IntroStep } from '@/features/auth/components/voice-setup/steps/IntroStep'
import { DemoStep } from '@/features/auth/components/voice-setup/steps/DemoStep'
import { RecordStep } from '@/features/auth/components/voice-setup/steps/RecordStep'
import { ProcessingStep } from '@/features/auth/components/voice-setup/steps/ProcessingStep'
import { DoneStep } from '@/features/auth/components/voice-setup/steps/DoneStep'
import { useTheme } from '@/shared/hooks/useTheme'


type Step = 'intro' | 'demo' | 'record' | 'processing' | 'done'
const STEPS: Step[] = ['intro', 'demo', 'record', 'processing', 'done']

export default function VoiceSetupScreen() {
 const { theme } = useTheme()
  const { setVoiceProfile } = useAuthStore()
  const [step, setStep] = useState<Step>('intro')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const recorder = useVoiceRecorder()
  const demo = useDemoPlayer()

  const stepIndex = STEPS.indexOf(step)

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync()
    return () => { demo.cleanup() }
  }, [])

  const submitVoiceProfile = useCallback(async () => {
    if (!recorder.recordingUri) return
    setStep('processing')
    try {
      const profile = await AuthService.createVoiceProfile(recorder.recordingUri)
      setVoiceProfile(profile)
      setStep('done')
    } catch (error) {
      console.error('createVoiceProfile failed:', error)
      setSubmitError('Voice processing failed. Please try again.')
      setStep('record')
    }
  }, [recorder.recordingUri, setVoiceProfile])

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <VoiceSetupStepIndicator current={stepIndex} total={STEPS.length} theme={theme} />

      {step === 'intro' && <IntroStep theme={theme} />}

      {step === 'demo' && (
        <DemoStep
          theme={theme}
          isPlaying={demo.isPlaying}
          onPlay={demo.play}
          onStop={demo.stop}
        />
      )}

      {step === 'record' && (
        <RecordStep
          theme={theme}
          isRecording={recorder.isRecording}
          recordingUri={recorder.recordingUri}
          recordingSeconds={recorder.recordingSeconds}
          error={recorder.error ?? submitError}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
          onReset={recorder.resetRecording}
          onSubmit={submitVoiceProfile}
          formatTime={recorder.formatTime}
        />
      )}

      {step === 'processing' && <ProcessingStep theme={theme} />}

      {step === 'done' && <DoneStep theme={theme} />}

      {/* footer */}
      <View style={styles.footer}>
        {step === 'intro' && (
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.text }]}
            onPress={() => setStep('demo')}
          >
            <Text style={[styles.primaryButtonText, { color: theme.background }]}>
              Hear a sample first
            </Text>
          </Pressable>
        )}

        {step === 'demo' && (
          <View style={styles.row}>
            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={() => setStep('record')}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                Skip to recording
              </Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.text, flex: 1 }]}
              onPress={() => { demo.stop(); setStep('record') }}
            >
              <Text style={[styles.primaryButtonText, { color: theme.background }]}>
                Record my voice
              </Text>
            </Pressable>
          </View>
        )}

        {step === 'done' && (
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.text }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[styles.primaryButtonText, { color: theme.background }]}>
              Start reading
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
  secondaryButton: {
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
})