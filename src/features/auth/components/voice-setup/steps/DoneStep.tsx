import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { Check } from 'lucide-react-native'

export function DoneStep({ theme }: { theme: Theme }) {
  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSecondary }]}>
        <Check size={32} color={theme.text} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>
        Your voice{'\n'}is ready.
      </Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        Athena will now read every book to you in your own voice.
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
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
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