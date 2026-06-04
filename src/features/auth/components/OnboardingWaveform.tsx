import { View, StyleSheet } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { Colors, Theme } from '@/shared/constants/colors'

const BAR_COUNT = 40

type Props = {
  progress: SharedValue<number>
  theme: Theme
}

function WaveBar({
  index,
  heightFactor,
  progress,
  theme,
}: {
  index: number
  heightFactor: number
  progress: SharedValue<number>
  theme: Theme
}) {
  const barStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value >= index / BAR_COUNT
      ? theme.text
      : theme.text + '30',
  }))

  return (
    <Animated.View
      style={[styles.bar, { height: 48 * heightFactor + 4 }, barStyle]}
    />
  )
}

export function OnboardingWaveform({ progress, theme }: Props) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) =>
    Math.abs(Math.sin((i / BAR_COUNT) * Math.PI * 4)) * 0.7 + 0.15
  )

  return (
    <View style={styles.container}>
      {bars.map((h, i) => (
        <WaveBar key={i} index={i} heightFactor={h} progress={progress} theme={theme} />
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