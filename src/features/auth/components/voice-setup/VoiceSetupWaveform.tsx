import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  cancelAnimation,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { Spacing, Radius } from '@/shared/constants/spacing'

const { width } = Dimensions.get('window')
const BAR_COUNT = 40

type Props = {
  isActive: boolean
  color: string
  mode?: 'playback' | 'record'
}

function WaveBar({
  index,
  isActive,
  color,
  mode,
}: {
  index: number
  isActive: boolean
  color: string
  mode: 'playback' | 'record'
}) {
  const height = useSharedValue(4)

  useEffect(() => {
    if (isActive) {
      const maxH = mode === 'record'
        ? 20 + Math.random() * 44
        : 8 + Math.sin((index / BAR_COUNT) * Math.PI) * 40

      height.value = withRepeat(
        withSequence(
          withTiming(maxH, { duration: 300 + Math.random() * 400 }),
          withTiming(4 + Math.random() * 8, { duration: 300 + Math.random() * 400 })
        ),
        -1,
        true
      )
    } else {
      cancelAnimation(height)
      height.value = withSpring(4)
    }
  }, [isActive])

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: interpolate(height.value, [4, 64], [0.3, 1], Extrapolation.CLAMP),
  }))

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  )
}

export function VoiceSetupWaveform({ isActive, color, mode = 'playback' }: Props) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => i)

  return (
    <View style={styles.container}>
      {bars.map(i => (
        <WaveBar key={i} index={i} isActive={isActive} color={color} mode={mode} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 3,
  },
  bar: {
    width: (width - Spacing.xl * 2 - BAR_COUNT * 3) / BAR_COUNT,
    borderRadius: Radius.full,
    minHeight: 4,
  },
})