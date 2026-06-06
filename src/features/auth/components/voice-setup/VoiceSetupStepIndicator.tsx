import { View, StyleSheet } from 'react-native'
import { Theme } from '@/shared/constants/colors'
import { Spacing, Radius } from '@/shared/constants/spacing'

type Props = {
  current: number
  total: number
  theme: Theme
}

export function VoiceSetupStepIndicator({ current, total, theme }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i <= current ? theme.text : theme.border,
              width: i === current ? 20 : 6,
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxxl,
  },
  dot: {
    height: 6,
    borderRadius: Radius.full,
  },
})