import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Colors } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { SAMPLE_BOOKS } from '@/shared/constants/welcome'

const { width, height } = Dimensions.get('window')


export default function WelcomeScreen() {
  const colorScheme = useColorScheme()
  const scheme = (colorScheme as keyof typeof Colors) ?? 'light'
  const theme = Colors[scheme]

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <Animated.View
        entering={FadeInDown.delay(200).duration(600).springify()}
        style={styles.booksContainer}
      >
        {SAMPLE_BOOKS.map((book, index) => (
          <Animated.View
            key={book.id}
            entering={FadeInDown.delay(400 + index * 200).duration(800).springify()}
          >
            <View
              style={[
                styles.bookWrapper,
                {
                  transform: [
                    { rotate: book.rotate },
                    { translateY: book.translateY },
                  ],
                  zIndex: index === 1 ? 3 : 1,
                },
              ]}
            >
              <Image
                source={{ uri: book.cover }}
                style={styles.bookCover}
                contentFit="cover"
              />
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(500).springify()}
        style={styles.content}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Read more.{'\n'}In your own voice.
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Athena reads any book to you in a voice cloned from yours.
        </Text>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.text }]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={[styles.primaryButtonText, { color: theme.background }]}>
            Get started
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={[styles.secondaryButton, { color: theme.textSecondary }]}>
            I already have an account
          </Text>
        </Pressable>
      </Animated.View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: height * 0.08,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  booksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bookWrapper: {
    marginHorizontal: -Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  bookCover: {
    width: width * 0.35,
    height: height * 0.32,
    borderRadius: Radius.sm,
  },
 content: {
    width: '100%',
    gap: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * 1.2,
    
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.6,
  },
  primaryButton: {
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
  secondaryButton: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
})