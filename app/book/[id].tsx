import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from 'react-native-reanimated'
import { ChevronLeft, BookOpen, Play, Mic, Check, Plus } from 'lucide-react-native'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import type { LibraryItem } from '@/shared/types/book'
import { useTheme } from '@/shared/hooks/useTheme'

const { width, height } = Dimensions.get('window')
const COVER_HEIGHT = height * 0.45
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

export default function BookDetailScreen() {
  const { theme, scheme } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { items, addBook, removeBook, parseEpub, isLoading } = useLibraryStore()
  const { openPlayer, libraryItemId: currentlyPlayingId } = usePlayerStore()
  const { voiceProfile } = useAuthStore()

  const [book, setBook] = useState<LibraryItem | null>(null)
  const [isInLibrary, setIsInLibrary] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  const scrollY = useSharedValue(0)

  useEffect(() => {
    const found = items.find(item => String(item.id) === id)
    if (found) {
      setBook(found)
      setIsInLibrary(true)
    }
  }, [id, items])

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y
  })

  const coverStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, COVER_HEIGHT],
          [0, -COVER_HEIGHT * 0.4],
          Extrapolation.CLAMP
        ),
      },
    ],
  }))

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COVER_HEIGHT - 100, COVER_HEIGHT - 40],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }))

  const handleAddToLibrary = useCallback(async () => {
    if (!book) return
    setIsAdding(true)
    try {
      const added = await addBook(book)
      setBook(added)
      setIsInLibrary(true)
    } catch (e) {
      console.error('addBook failed:', e)
      Alert.alert('Error', 'Failed to add book to library.')
    } finally {
      setIsAdding(false)
    }
  }, [book, addBook])

  const handleRemoveFromLibrary = useCallback(async () => {
    if (!book) return
    Alert.alert(
      'Remove book',
      'Remove this book from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeBook(book.id)
            router.back()
          },
        },
      ]
    )
  }, [book, removeBook])

  const handleListen = useCallback(async () => {
    if (!book) return

    if (!voiceProfile || voiceProfile.status !== 'ready') {
      Alert.alert(
        'No voice profile',
        'Set up your voice first to listen in your own voice.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set up voice',
            onPress: () => router.push('/(auth)/voice-setup'),
          },
        ]
      )
      return
    }

    if (!isInLibrary) {
      await handleAddToLibrary()
    }

    setIsParsing(true)
    try {
      await parseEpub(book.id)
      openPlayer(book.id)
      router.push('/player')
    } catch (e) {
      console.error('parseEpub/openPlayer failed:', e)
      Alert.alert('Error', 'Could not parse this book. Please try again.')
    } finally {
      setIsParsing(false)
    }
  }, [book, voiceProfile, isInLibrary, handleAddToLibrary, parseEpub, openPlayer])

  const handleRead = useCallback(async () => {
    if (!book) return
    if (!isInLibrary) await handleAddToLibrary()
    router.push(`/reader/${String(book.id)}`)
  }, [book, isInLibrary, handleAddToLibrary])

  if (!book) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    )
  }

  const isCurrentlyPlaying = currentlyPlayingId === book.id

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top }, headerStyle]}>
        <BlurView
          intensity={90}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButtonRow}>
          <ChevronLeft size={18} color={theme.text} />
          <Text style={[styles.backButton, { color: theme.text }]}>Back</Text>
        </Pressable>
        <Text style={[styles.stickyTitle, { color: theme.text }]} numberOfLines={1}>
          {book.title}
        </Text>
      </Animated.View>

      <Animated.View style={[styles.topBack, { paddingTop: insets.top + Spacing.md }]} entering={FadeIn}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.topBackButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
        >
          <ChevronLeft size={20} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <Animated.View style={[styles.coverContainer, coverStyle]}>
          {book.cover_url ? (
            <Image source={{ uri: book.cover_url }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={[styles.cover, styles.placeholderCover, { backgroundColor: theme.backgroundSecondary }]}>
              <BookOpen size={64} color={theme.textTertiary} />
            </View>
          )}
          <View style={[styles.coverGradient, { backgroundColor: theme.background }]} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.content}>
          <View style={[styles.sourceBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.sourceText, { color: theme.textTertiary }]}>
              {book.source === 'gutenberg' ? 'Project Gutenberg' :
               book.source === 'open_library' ? 'Open Library' :
               book.source === 'imported' ? 'Imported' : book.source}
            </Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: theme.textSecondary }]}>{book.author}</Text>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.listenButton,
                { backgroundColor: theme.text },
                (isParsing || isLoading) && { opacity: 0.6 },
              ]}
              onPress={handleListen}
              disabled={isParsing || isLoading}
            >
              {isParsing ? (
                <ActivityIndicator color={theme.background} size="small" />
              ) : isCurrentlyPlaying ? (
                <>
                  <Play size={18} color={theme.background} fill={theme.background} />
                  <Text style={[styles.listenButtonText, { color: theme.background }]}>Now playing</Text>
                </>
              ) : (
                <>
                  <Mic size={18} color={theme.background} />
                  <Text style={[styles.listenButtonText, { color: theme.background }]}>Listen in your voice</Text>
                </>
              )}
            </Pressable>

            <Pressable style={[styles.readButton, { borderColor: theme.border }]} onPress={handleRead}>
              <BookOpen size={18} color={theme.text} />
              <Text style={[styles.readButtonText, { color: theme.text }]}>Read</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.libraryAction}
            onPress={isInLibrary ? handleRemoveFromLibrary : handleAddToLibrary}
            disabled={isAdding}
          >
            {isAdding ? (
              <Text style={[styles.libraryActionText, { color: theme.textSecondary }]}>Adding...</Text>
            ) : isInLibrary ? (
              <>
                <Check size={14} color={theme.textSecondary} />
                <Text style={[styles.libraryActionText, { color: theme.textSecondary }]}>In your library · Remove</Text>
              </>
            ) : (
              <>
                <Plus size={14} color={theme.textSecondary} />
                <Text style={[styles.libraryActionText, { color: theme.textSecondary }]}>Add to library</Text>
              </>
            )}
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.details}>
            <DetailRow label="Source" value={book.source} theme={theme} />
            {book.external_id && <DetailRow label="ID" value={book.external_id} theme={theme} />}
            <DetailRow
              label="Format"
              value={book.epub_url ? 'EPUB available' : 'No EPUB'}
              theme={theme}
            />
          </View>
        </Animated.View>
      </AnimatedScrollView>
    </View>
  )
}

function DetailRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButton: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  stickyTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    flex: 1,
  },
  topBack: {
    position: 'absolute',
    left: Spacing.xl,
    zIndex: 50,
  },
  topBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    height: COVER_HEIGHT,
    width: '100%',
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.85,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sourceText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * 1.2,
  },
  author: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    marginTop: -Spacing.sm,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  listenButton: {
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  listenButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
  readButton: {
    height: 52,
    borderRadius: Radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  readButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
  libraryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  libraryActionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  divider: {
    height: 0.5,
    marginVertical: Spacing.sm,
  },
  details: { gap: Spacing.md },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  detailValue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
})