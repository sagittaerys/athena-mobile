import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated'
import { Colors } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'

const { width, height } = Dimensions.get('window')

const SAMPLE_BOOKS = [
  { id: '1', cover: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg', rotate: '-15deg', translateY: 20 },
  { id: '2', cover: 'https://www.gutenberg.org/cache/epub/1232/pg1232.cover.medium.jpg', rotate: '0deg', translateY: 0 },
  { id: '3', cover: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg', rotate: '15deg', translateY: 20 },
]

export default function WelcomeScreen() {
  const colorScheme = useColorScheme()
  const scheme = (colorScheme as keyof typeof Colors) ?? 'light'
  const theme = Colors[scheme]

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.booksContainer}
      >
        {SAMPLE_BOOKS.map((book, index) => (
          <Animated.View
            key={book.id}
            entering={FadeInDown.delay(200 + index * 100).springify()}
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
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxxl,
  },
  booksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: height * 0.08,
    height: height * 0.35,
  },
  bookWrapper: {
    marginHorizontal: -Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bookCover: {
    width: width * 0.28,
    height: height * 0.28,
    borderRadius: Radius.sm,
  },
  content: {
    width: '100%',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
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