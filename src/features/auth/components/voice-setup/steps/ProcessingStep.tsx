import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing } from '@/shared/constants/spacing'

export function ProcessingStep({ theme }: { theme: Theme }) {
  return (
    <Animated.View entering={FadeIn.springify()} style={styles.container}>
      <ActivityIndicator size="large" color={theme.text} />
      <Text style={[styles.title, { color: theme.text }]}>
        Creating{'\n'}your voice...
      </Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        This takes about 30 seconds. Athena is learning the sound of you.
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * 1.15,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.65,
    textAlign: 'center',
  },
})