import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { SlideType, MEDITATIONS_COVER } from '@/shared/constants/onboarding'
import { OnboardingWaveform } from './OnboardingWaveform'

const { width, height } = Dimensions.get('window')

type Props = {
  item: SlideType
  index: number
  scrollX: SharedValue<number>
  theme: Theme
  waveformProgress: SharedValue<number>
}

export function OnboardingSlide({ item, index, scrollX, theme, waveformProgress }: Props) {
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
        <Animated.View style={[styles.textContent, animatedStyle]}>
          <Image
            source={{ uri: MEDITATIONS_COVER }}
            style={styles.bookCover}
            contentFit="cover"
          />
          <View style={[styles.quoteBox, { borderLeftColor: theme.text }]}>
            <Text style={[styles.quoteText, { color: theme.text }]}>
              "You have power over your mind, not outside events. Realize this, and you will find strength."
            </Text>
            <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
              — Marcus Aurelius, Meditations
            </Text>
          </View>
          <OnboardingWaveform progress={waveformProgress} theme={theme} />
          <Text style={[styles.body, { color: theme.textSecondary }]}>
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
        <Text style={[styles.headline, { color: '#FFFFFF' }]}>
          {item.headline}
        </Text>
        <Text style={[styles.body, { color: 'rgba(255,255,255,0.75)' }]}>
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
    height: height * 0.62,
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  textContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: height * 0.08,
    gap: Spacing.xl,
  },
  bookCover: {
    width: 80,
    height: 110,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  quoteBox: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.md,
    gap: Spacing.sm,
  },
  quoteText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.6,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
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