import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { Dot } from 'lucide-react-native'

const TIPS = [
  'Quiet room, minimal background noise',
  'Read at your natural pace',
  'Hold your phone comfortably',
]

export function IntroStep({ theme }: { theme: Theme }) {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOut}
      style={styles.container}
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={styles.icon}>🎙️</Text>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        Let's clone{'\n'}your voice.
      </Text>

      <Text style={[styles.body, { color: theme.textSecondary }]}>
        We need about 60 seconds of you reading aloud. Athena will use this to synthesise
        speech that sounds exactly like you.{'\n\n'}
        Find a quiet place and read naturally, no need to be perfect.
      </Text>

      <View style={styles.tips}>
        {TIPS.map(tip => (
          <View key={tip} style={styles.tip}>
            <Dot size={20} color={theme.text} />
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>{tip}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 32 },
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
  tips: { gap: Spacing.sm },
  tip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  tipText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
    flex: 1,
  },
})