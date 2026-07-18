import { useRef, useState, useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, FlatList, ViewToken } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { SLIDES, ONBOARDING_KEY } from '@/shared/constants/onboarding'
import { OnboardingSlide } from '@/features/auth/components/OnboardingSlide'
import { OnboardingDot } from '@/features/auth/components/OnboardingDot'
 import { useTheme } from '@/shared/hooks/useTheme'

export default function OnboardingScreen() {
  const { theme } = useTheme()
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const scrollX = useSharedValue(0)
  const waveformProgress = useSharedValue(0)


  useEffect(() => {
    if (activeIndex === 1) {
      // i'll preload audio when the user starts the flow here....
    }
    if (activeIndex === 2) {
      
      waveformProgress.value = withTiming(1, { duration: 8000 })
    } else {
      waveformProgress.value = 0
    }
  }, [activeIndex])

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index)
      }
    },
    []
  )

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      router.replace('/(auth)/welcome')
    }
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(auth)/welcome')
  }

  const isLast = activeIndex === SLIDES.length - 1

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!isLast && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.skipContainer}>
          <Pressable onPress={handleSkip} hitSlop={16}>
            <Text style={[styles.skip, { color: theme.textSecondary }]}>Skip</Text>
          </Pressable>
        </Animated.View>
      )}

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        onScroll={event => { scrollX.value = event.nativeEvent.contentOffset.x }}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            item={item}
            index={index}
            scrollX={scrollX}
            theme={theme}
            waveformProgress={waveformProgress}
          />
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <OnboardingDot
              key={index}
              index={index}
              activeIndex={activeIndex}
              theme={theme}
            />
          ))}
        </View>
        <Pressable
          style={[styles.button, { backgroundColor: theme.text }]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>
            {isLast ? 'Continue' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
  },
  skip: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 48,
    gap: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  button: {
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
})