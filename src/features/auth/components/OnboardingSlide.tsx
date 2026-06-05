import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { OnboardingWaveform as Waveform } from './OnboardingWaveform'
import { SlideType } from '@/shared/constants/onboarding'
import { useEffect } from 'react'

const { width, height } = Dimensions.get('window')

type Props = {
  item: SlideType
  index: number
  scrollX: SharedValue<number>
  theme: Theme
  waveformProgress: SharedValue<number>
}

function ReaderTag({ theme }: { theme: Theme }) {
  const floatY = useSharedValue(0)
  const floatX = useSharedValue(0)

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    )

    floatX.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 2500 }),
        withTiming(-4, { duration: 2500 })
      ),
      -1,
      true
    )
  }, [])

  const tagStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateX: floatX.value },
    ],
  }))

  return (
    <Animated.View
      style={[styles.readerTag, { backgroundColor: theme.surface }, tagStyle]}
    >
      <Image
        source={require('../../../../assets/images/sage.png')}
        style={styles.readerAvatar}
        contentFit="cover"
      />
      <View style={styles.readerInfo}>
        <Text style={[styles.readerLabel, { color: theme.textSecondary }]}>
          Voice
        </Text>
        <Text style={[styles.readerName, { color: theme.text }]}>
          Olamilekan Aremu
        </Text>
      </View>
    </Animated.View>
  )
}

export function OnboardingSlide({
  item,
  index,
  scrollX,
  theme,
  waveformProgress,
}: Props) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
    return {
      opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
      transform: [{
        translateY: interpolate(scrollX.value, inputRange, [32, 0, 32], Extrapolation.CLAMP),
      }],
    }
  })

  if (index === 2) {
    return (
      <View style={styles.slide}>
        <Image
          source={require('../../../../assets/images/meditations.png')}
          style={styles.fullBleedImage}
          contentFit="cover"
        />

        <View style={styles.tagContainer}>
          <ReaderTag theme={theme} />
        </View>

        <Animated.View style={[styles.slide3Content, animatedStyle]}>
          <Text style={[styles.slide3Headline, { color: theme.text }]}>
            {item.headline}
          </Text>

          <View style={[styles.quoteBox, { borderLeftColor: theme.border }]}>
            <Text style={[styles.quoteText, { color: theme.text }]}>
              "You have power over your mind, not outside events. Realize this, and you will find strength."
            </Text>
            <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
              Marcus Aurelius, Meditations
            </Text>
          </View>

          <Waveform progress={waveformProgress} theme={theme} />

          <Text style={[styles.slide3Body, { color: theme.textSecondary }]}>
            {item.body}
          </Text>
        </Animated.View>
      </View>
    )
  }

  return (
    <View style={styles.slide}>
      <Image
        source={item.image}
        style={styles.fullBleedImage}
        contentFit="cover"
      />
      <Animated.View style={[styles.imageTextContent, animatedStyle]}>
        <Text style={[styles.headline, { color: theme.text }]}>
          {item.headline}
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {item.body}
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  slide: {
    width,
    flex: 1,
  },
  fullBleedImage: {
    width,
    height: height * 0.58,
    position: 'absolute',
    top: 0,
  },
  tagContainer: {
    position: 'absolute',
    top: height * 0.12,
    right: Spacing.xl,
    zIndex: 10,
  },
  readerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  readerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  readerInfo: {
    gap: 1,
  },
  readerLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 12,
  },
  readerName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  slide3Content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  slide3Headline: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * 1.15,
  },
  quoteBox: {
    
    gap: Spacing.xs,
  },
  quoteText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.6,
  },
  quoteAuthor: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  slide3Body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.65,
  },
  imageTextContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  headline: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * 1.15,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.65,
  },
})