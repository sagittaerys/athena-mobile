import { Text, StyleSheet, Pressable } from 'react-native'
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { VoiceSetupWaveform } from '../VoiceSetupWaveform'
import { Play, Pause } from "lucide-react-native"


type Props = {
  theme: Theme
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
}

export function DemoStep({ theme, isPlaying, onPlay, onStop }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOut}
      style={styles.container}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        This is what{'\n'}Athena sounds like.
      </Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        Yours will sound like you. Tap play to hear a sample.
      </Text>

      <VoiceSetupWaveform isActive={isPlaying} color={theme.text} mode="playback" />

      <Pressable
        style={[styles.playButton, { borderColor: theme.border }]}
        onPress={isPlaying ? onStop : onPlay}
      >
        {isPlaying ? (
          <Pause size={20} color={theme.text} />
        ) : (
          <Play size={20} color={theme.text} />
        )}
        <Text style={[styles.playButtonText, { color: theme.text }]}>
          {isPlaying ? 'Pause' : 'Play sample'}
        </Text>
      </Pressable>
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
  playButton: {
    height: 52,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  playButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
})