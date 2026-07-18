import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { ChevronLeft } from 'lucide-react-native'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import type { EpubChapter } from '@/shared/types/book'
import { useTheme } from '@/shared/hooks/useTheme'

type ReaderFont = 'serif' | 'sans'
type ReaderSize = 'sm' | 'md' | 'lg'

const FONT_SIZES: Record<ReaderSize, number> = { sm: 15, md: 17, lg: 20 }
const SERIF_FONT = 'Georgia'
const SANS_FONT = FontFamily.regular

function ReaderControls({
  visible,
  font,
  size,
  onFontChange,
  onSizeChange,
  onClose,
  theme,
}: {
  visible: boolean
  font: ReaderFont
  size: ReaderSize
  onFontChange: (f: ReaderFont) => void
  onSizeChange: (s: ReaderSize) => void
  onClose: () => void
  theme: Theme
}) {
  if (!visible) return null
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={[styles.controlsOverlay, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Text style={[styles.controlsTitle, { color: theme.textTertiary }]}>APPEARANCE</Text>

      <View style={styles.controlsRow}>
        <Text style={[styles.controlsLabel, { color: theme.text }]}>Font</Text>
        <View style={styles.controlsToggle}>
          {(['serif', 'sans'] as ReaderFont[]).map(f => (
            <Pressable
              key={f}
              style={[
                styles.toggleOption,
                { borderColor: theme.border, backgroundColor: font === f ? theme.text : 'transparent' },
              ]}
              onPress={() => onFontChange(f)}
            >
              <Text style={[styles.toggleText, { color: font === f ? theme.background : theme.text }]}>
                {f === 'serif' ? 'Serif' : 'Sans'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.controlsRow}>
        <Text style={[styles.controlsLabel, { color: theme.text }]}>Size</Text>
        <View style={styles.controlsToggle}>
          {(['sm', 'md', 'lg'] as ReaderSize[]).map(s => (
            <Pressable
              key={s}
              style={[
                styles.toggleOption,
                { borderColor: theme.border, backgroundColor: size === s ? theme.text : 'transparent' },
              ]}
              onPress={() => onSizeChange(s)}
            >
              <Text style={[styles.toggleText, { color: size === s ? theme.background : theme.text }]}>
                {s === 'sm' ? 'A' : s === 'md' ? 'A' : 'A'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={styles.controlsDone} onPress={onClose}>
        <Text style={[styles.controlsDoneText, { color: theme.text }]}>Done</Text>
      </Pressable>
    </Animated.View>
  )
}

export default function ReaderScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { items, getChapters, parseEpub } = useLibraryStore()
  const { currentChapterIndex, currentChunkIndex, isPlaying } = usePlayerStore()

  const [chapters, setChapters] = useState<EpubChapter[]>([])
  const [activeChapter, setActiveChapter] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [font, setFont] = useState<ReaderFont>('serif')
  const [size, setSize] = useState<ReaderSize>('md')
  const [showChrome, setShowChrome] = useState(true)

  const chromeOpacity = useSharedValue(1)

  const book = items.find(item => String(item.id) === id)

  useEffect(() => {
    if (!id) return
    const cached = getChapters(Number(id))
    if (cached.length) {
      setChapters(cached)
    } else {
      parseEpub(Number(id)).then(setChapters).catch(() => {})
    }
  }, [id])

  useEffect(() => {
    if (isPlaying) {
      setActiveChapter(currentChapterIndex)
    }
  }, [currentChapterIndex, isPlaying])

  const toggleChrome = useCallback(() => {
    const next = !showChrome
    setShowChrome(next)
    chromeOpacity.value = withTiming(next ? 1 : 0, { duration: 200 })
  }, [showChrome])

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chromeOpacity.value,
  }))

  const currentChapter = chapters[activeChapter]
  const fontSize = FONT_SIZES[size]
  const fontFamily = font === 'serif' ? SERIF_FONT : SANS_FONT

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.readerHeader,
          { paddingTop: insets.top + Spacing.md, borderBottomColor: theme.border },
          chromeStyle,
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <ChevronLeft size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
        </Pressable>
        <Text style={[styles.readerTitle, { color: theme.text }]} numberOfLines={1}>
          {book?.title ?? 'Reader'}
        </Text>
        <Pressable onPress={() => setShowControls(v => !v)} hitSlop={12}>
          <Text style={[styles.settingsIcon, { color: theme.text }]}>Aa</Text>
        </Pressable>
      </Animated.View>

      {chapters.length > 1 && (
        <Animated.View style={[styles.chapterBar, chromeStyle]}>
          <FlatList
            data={chapters}
            keyExtractor={c => String(c.chapter_index)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chapterBarContent}
            renderItem={({ item: chapter }) => (
              <Pressable
                style={[
                  styles.chapterPill,
                  {
                    backgroundColor:
                      activeChapter === chapter.chapter_index ? theme.text : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => setActiveChapter(chapter.chapter_index)}
              >
                <Text
                  style={[
                    styles.chapterPillText,
                    {
                      color: activeChapter === chapter.chapter_index ? theme.background : theme.textSecondary,
                    },
                  ]}
                >
                  {chapter.title}
                </Text>
              </Pressable>
            )}
          />
        </Animated.View>
      )}

      <Pressable style={{ flex: 1 }} onPress={toggleChrome}>
        <FlatList
          data={currentChapter?.chunks ?? []}
          keyExtractor={chunk => String(chunk.chunk_index)}
          contentContainerStyle={[styles.textContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: chunk }) => {
            const isCurrentChunk =
              isPlaying &&
              currentChapterIndex === activeChapter &&
              currentChunkIndex === chunk.chunk_index

            return (
              <Text
                style={[
                  styles.chunkText,
                  {
                    fontSize,
                    fontFamily,
                    color: theme.text,
                    backgroundColor: isCurrentChunk ? theme.backgroundSecondary : 'transparent',
                  },
                ]}
              >
                {chunk.text}
              </Text>
            )
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Loading chapter...</Text>
          }
        />
      </Pressable>

      <ReaderControls
        visible={showControls}
        font={font}
        size={size}
        onFontChange={setFont}
        onSizeChange={setSize}
        onClose={() => setShowControls(false)}
        theme={theme}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  readerTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  settingsIcon: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  chapterBar: {
    borderBottomWidth: 0.5,
  },
  chapterBarContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chapterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chapterPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  textContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
  },
  chunkText: {
    lineHeight: 28,
    borderRadius: Radius.sm,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 80,
    right: Spacing.xl,
    width: 240,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: Spacing.lg,
    gap: Spacing.lg,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  controlsTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  controlsToggle: {
    flexDirection: 'row',
    borderRadius: Radius.sm,
    overflow: 'hidden',
    gap: 1,
  },
  toggleOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 0.5,
    borderRadius: Radius.sm,
  },
  toggleText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  controlsDone: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  controlsDoneText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
})