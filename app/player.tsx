import { View, Text, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import Slider from '@react-native-community/slider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronDown, Play, Pause, SkipBack, SkipForward, BookOpen } from 'lucide-react-native'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { useChunkPlayer } from '@/features/player/hooks/useChunkPlayer'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'

export default function PlayerScreen() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const insets = useSafeAreaInsets()

  const { libraryItemId, isPlaying, positionSeconds, durationSeconds, status } = usePlayerStore()
  const { items } = useLibraryStore()
  const { togglePlay, skipNext, skipPrevious } = useChunkPlayer(libraryItemId)

  const book = items.find(item => item.id === libraryItemId)
  if (!book) return null

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
        <ChevronDown size={28} color={theme.text} />
      </Pressable>

      <View style={styles.coverWrapper}>
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.placeholderCover, { backgroundColor: theme.backgroundSecondary }]}>
            <BookOpen size={64} color={theme.textTertiary} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{book.title}</Text>
        <Text style={[styles.author, { color: theme.textSecondary }]}>{book.author}</Text>
      </View>

      <View style={styles.progress}>
        <Slider
          style={{ width: '100%' }}
          value={positionSeconds}
          minimumValue={0}
          maximumValue={durationSeconds || 1}
          minimumTrackTintColor={theme.text}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.text}
        />
        <View style={styles.timeRow}>
          <Text style={[styles.time, { color: theme.textTertiary }]}>{formatTime(positionSeconds)}</Text>
          <Text style={[styles.time, { color: theme.textTertiary }]}>{formatTime(durationSeconds)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={skipPrevious} hitSlop={12}>
          <SkipBack size={28} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={togglePlay}
          style={[styles.playButton, { backgroundColor: theme.text }]}
        >
          {isPlaying ? (
            <Pause size={28} color={theme.background} fill={theme.background} />
          ) : (
            <Play size={28} color={theme.background} fill={theme.background} />
          )}
        </Pressable>
        <Pressable onPress={skipNext} hitSlop={12}>
          <SkipForward size={28} color={theme.text} />
        </Pressable>
      </View>

      {status === 'loading' && (
        <Text style={[styles.statusText, { color: theme.textTertiary }]}>Generating audio…</Text>
      )}
    </View>
  )
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.xl },
  closeButton: { alignSelf: 'flex-start', padding: Spacing.sm },
  coverWrapper: { alignItems: 'center', marginTop: Spacing.xl },
  cover: { width: 260, height: 260, borderRadius: Radius.lg },
  placeholderCover: { alignItems: 'center', justifyContent: 'center' },
  info: { alignItems: 'center', marginTop: Spacing.xxl, gap: 4 },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, textAlign: 'center' },
  author: { fontFamily: FontFamily.regular, fontSize: FontSize.md },
  progress: { marginTop: Spacing.xxl },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontFamily: FontFamily.regular, fontSize: FontSize.xs },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    textAlign: 'center',
    marginTop: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
})