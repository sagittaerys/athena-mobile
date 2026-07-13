import { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeInDown,
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
import { ChevronDown, X, BookOpen, RotateCcw, RotateCw, Play, Pause } from 'lucide-react-native'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { useAudioPlayer } from '@/features/player/hooks/useAudioPlayer'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import type { PlaybackSpeed } from '@/shared/types/audio'

const { width, height } = Dimensions.get('window')
const BAR_COUNT = 48

const SPEEDS: PlaybackSpeed[] = [0.75, 1, 1.25, 1.5, 2]

function PlayerWaveform({ isPlaying, color }: { isPlaying: boolean; color: string }) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => i)

  return (
    <View style={styles.waveform}>
      {bars.map(i => (
        <WaveBar key={i} index={i} isPlaying={isPlaying} color={color} />
      ))}
    </View>
  )
}

function WaveBar({ index, isPlaying, color }: { index: number; isPlaying: boolean; color: string }) {
  const h = useSharedValue(3)

  useEffect(() => {
    if (isPlaying) {
      const maxH = 8 + Math.sin((index / BAR_COUNT) * Math.PI * 2) * 24 + Math.random() * 16
      h.value = withRepeat(
        withSequence(
          withTiming(maxH, { duration: 250 + Math.random() * 350 }),
          withTiming(3 + Math.random() * 6, { duration: 250 + Math.random() * 350 })
        ),
        -1,
        true
      )
    } else {
      cancelAnimation(h)
      h.value = withSpring(3)
    }
  }, [isPlaying])

  const animStyle = useAnimatedStyle(() => ({
    height: h.value,
    opacity: interpolate(h.value, [3, 48], [0.25, 0.85], Extrapolation.CLAMP),
  }))

  return (
    <Animated.View
      style={[{ width: (width - Spacing.xl * 2 - BAR_COUNT * 2.5) / BAR_COUNT, borderRadius: 99, backgroundColor: color }, animStyle]}
    />
  )
}

function ProgressBar({
  position,
  duration,
  theme,
}: {
  position: number
  duration: number
  theme: Theme
}) {
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theme.text, width: `${progress * 100}%` },
          ]}
        />
      </View>
      <View style={styles.progressTimes}>
        <Text style={[styles.timeText, { color: theme.textTertiary }]}>
          {formatTime(position)}
        </Text>
        <Text style={[styles.timeText, { color: theme.textTertiary }]}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  )
}

function SpeedSelector({
  speed,
  onSelect,
  theme,
}: {
  speed: PlaybackSpeed
  onSelect: (s: PlaybackSpeed) => void
  theme: Theme
}) {
  return (
    <View style={styles.speedContainer}>
      {SPEEDS.map(s => (
        <Pressable
          key={s}
          style={[
            styles.speedPill,
            {
              backgroundColor: speed === s ? theme.text : theme.backgroundSecondary,
              borderColor: speed === s ? theme.text : theme.border,
            },
          ]}
          onPress={() => onSelect(s)}
        >
          <Text
            style={[
              styles.speedText,
              { color: speed === s ? theme.background : theme.textSecondary },
            ]}
          >
            {s}x
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

export default function PlayerScreen() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const insets = useSafeAreaInsets()

  const {
    libraryItemId,
    isPlaying,
    status,
    positionSeconds,
    durationSeconds,
    speed,
    currentChapterIndex,
    currentChunkIndex,
    error,
    setSpeed,
    closePlayer,
  } = usePlayerStore()

  const { items } = useLibraryStore()
  const { playPause, skipForward, skipBack } = useAudioPlayer()

  const currentBook = items.find(item => item.id === libraryItemId)

  useEffect(() => {
    if (!currentBook) {
      router.back()
    }
  }, [currentBook])

  if (!currentBook) return null

  const coverBgStyle = currentBook.cover_url ? { opacity: 0.18 } : { opacity: 0 }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {currentBook.cover_url && (
        <Animated.View style={[StyleSheet.absoluteFill, coverBgStyle]}>
          <Image
            source={{ uri: currentBook.cover_url }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={40}
          />
        </Animated.View>
      )}

      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronDown size={22} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerLabel, { color: theme.textTertiary }]}>
            Now listening
          </Text>
          <Text style={[styles.headerChapter, { color: theme.textSecondary }]}>
            Chapter {currentChapterIndex + 1}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            closePlayer()
            router.back()
          }}
          hitSlop={12}
        >
          <X size={20} color={theme.textTertiary} />
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.coverContainer}>
        {currentBook.cover_url ? (
          <Image source={{ uri: currentBook.cover_url }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.placeholderCover, { backgroundColor: theme.backgroundSecondary }]}>
            <BookOpen size={64} color={theme.textTertiary} />
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
          {currentBook.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
          {currentBook.author}
        </Text>
      </Animated.View>

      <PlayerWaveform isPlaying={isPlaying} color={theme.text} />

      <ProgressBar position={positionSeconds} duration={durationSeconds} theme={theme} />

      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={skipBack} hitSlop={12}>
          <RotateCcw size={26} color={theme.text} />
          <Text style={[styles.controlLabel, { color: theme.textTertiary }]}>10s</Text>
        </Pressable>

        <Pressable
          style={[styles.playButton, { backgroundColor: theme.text }]}
          onPress={playPause}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <ActivityIndicator color={theme.background} />
          ) : isPlaying ? (
            <Pause size={28} color={theme.background} fill={theme.background} />
          ) : (
            <Play size={28} color={theme.background} fill={theme.background} />
          )}
        </Pressable>

        <Pressable style={styles.controlButton} onPress={skipForward} hitSlop={12}>
          <RotateCw size={26} color={theme.text} />
          <Text style={[styles.controlLabel, { color: theme.textTertiary }]}>10s</Text>
        </Pressable>
      </Animated.View>

      <SpeedSelector speed={speed} onSelect={setSpeed} theme={theme} />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={{ height: insets.bottom + Spacing.lg }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  headerLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerChapter: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  cover: {
    width: width * 0.58,
    height: width * 0.58 * 1.5,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  placeholderCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  bookTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  bookAuthor: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 2.5,
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  progressTrack: {
    height: 3,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  controlButton: {
    alignItems: 'center',
    gap: 2,
  },
  controlLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  speedPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  speedText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
})