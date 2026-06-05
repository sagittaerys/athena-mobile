import { View, StyleSheet } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'

const BAR_COUNT = 40

type Props = {
  progress: SharedValue<number>
  theme: Theme
  light?: boolean
}

function WaveBar({ index, heightFactor, progress, theme, light }: {
  index: number
  heightFactor: number
  progress: SharedValue<number>
  theme: Theme
  light?: boolean
}) {
  const barStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value >= index / BAR_COUNT
      ? light ? '#FFFFFF' : theme.text
      : light ? 'rgba(255,255,255,0.3)' : theme.text + '30',
  }))

  return (
    <Animated.View
      style={[styles.bar, { height: 48 * heightFactor + 4 }, barStyle]}
    />
  )
}

export function OnboardingWaveform({ progress, theme, light }: Props) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) =>
    Math.abs(Math.sin((i / BAR_COUNT) * Math.PI * 4)) * 0.7 + 0.15
  )

  return (
    <View style={styles.container}>
      {bars.map((h, i) => (
        <WaveBar key={i} index={i} heightFactor={h} progress={progress} theme={theme} light={light} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 52,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
})