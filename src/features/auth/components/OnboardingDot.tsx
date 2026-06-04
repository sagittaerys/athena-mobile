import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native'
import { Colors, Theme } from '@/shared/constants/colors'
import { Radius } from '@/shared/constants/spacing'

type Props = {
  index: number
  activeIndex: number
  theme: Theme
}

export function OnboardingDot({ index, activeIndex, theme }: Props) {
  const isActive = index === activeIndex

  const dotStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 24 : 6, { damping: 15, stiffness: 150 }),
    opacity: withSpring(isActive ? 1 : 0.3),
  }))

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: theme.text }, dotStyle]}
    />
  )
}

const styles = StyleSheet.create({
  dot: {
    height: 6,
    borderRadius: Radius.full,
  },
})