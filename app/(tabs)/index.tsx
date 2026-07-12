import { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { BookOpen, Inbox } from 'lucide-react-native'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { MiniPlayer } from '@/shared/components/MiniPlayer'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import type { LibraryItem } from '@/shared/types/book'

const { width } = Dimensions.get('window')
const COLUMN_GAP = Spacing.md
const PADDING = Spacing.xl
const CARD_WIDTH = (width - PADDING * 2 - COLUMN_GAP) / 2

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function BookCard({
  item,
  index,
  onPress,
  theme,
}: {
  item: LibraryItem
  index: number
  onPress: () => void
  theme: Theme
}) {
  const placeholderColor = [
    '#C9B99A', '#A8B5C2', '#B5C4A8', '#C4A8B5', '#A8C4C0',
  ][index % 5]

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable style={styles.bookCard} onPress={onPress}>
        {item.cover_url ? (
          <Image
            source={{ uri: item.cover_url }}
            style={[styles.bookCover, { backgroundColor: theme.backgroundSecondary }]}
            contentFit="cover"
            placeholder={theme.backgroundSecondary}
          />
        ) : (
          <View
            style={[
              styles.bookCover,
              styles.placeholderCover,
              { backgroundColor: placeholderColor + '33' },
            ]}
          >
            <BookOpen size={32} color={theme.textTertiary} />
          </View>
        )}

        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.bookAuthor, { color: theme.textTertiary }]} numberOfLines={1}>
            {item.author}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

function EmptyLibrary({ theme, onExplore }: { theme: Theme; onExplore: () => void }) {
  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.emptyContainer}>
      <Inbox size={48} color={theme.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Your library is empty
      </Text>
      <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
        Discover 70,000+ free books or import your own EPUBs.
      </Text>
      <Pressable
        style={[styles.exploreButton, { backgroundColor: theme.text }]}
        onPress={onExplore}
      >
        <Text style={[styles.exploreButtonText, { color: theme.background }]}>
          Browse books
        </Text>
      </Pressable>
    </Animated.View>
  )
}

export default function LibraryScreen() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const insets = useSafeAreaInsets()

  const { user } = useAuthStore()
  const { items, isLoading, fetchLibrary } = useLibraryStore()
  const { isVisible: playerVisible } = usePlayerStore()

  useEffect(() => {
    fetchLibrary()
  }, [])

  const handleBookPress = useCallback((item: LibraryItem) => {
    router.push({
      pathname: '/book/[id]',
      params: { id: String(item.id) },
    })
  }, [])

  const renderItem = useCallback(
    ({ item, index }: { item: LibraryItem; index: number }) => (
      <BookCard item={item} index={index} onPress={() => handleBookPress(item)} theme={theme} />
    ),
    [theme, handleBookPress]
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.username, { color: theme.text }]}>
          {user?.username ?? 'Reader'}
        </Text>
      </View>

      <Pressable
        style={[styles.addButton, { backgroundColor: theme.backgroundSecondary }]}
        onPress={() => router.push('/(tabs)/discover')}
      >
        <Text style={[styles.addButtonText, { color: theme.text }]}>+ Add book</Text>
      </Pressable>
    </View>
  )

  const bottomPadding = 80 + (playerVisible ? 72 : 0) + (insets.bottom || 0)

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {items.length === 0 && !isLoading ? (
        <>
          {renderHeader()}
          <EmptyLibrary theme={theme} onExplore={() => router.push('/(tabs)/discover')} />
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchLibrary}
              tintColor={theme.textTertiary}
            />
          }
        />
      )}

      <MiniPlayer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: PADDING,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  username: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
  },
  addButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  addButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  bookCard: {
    width: CARD_WIDTH,
    gap: Spacing.sm,
  },
  bookCover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    borderRadius: Radius.md,
  },
  placeholderCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    gap: 3,
  },
  bookTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  bookAuthor: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl * 1.5,
    gap: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.6,
  },
  exploreButton: {
    height: 52,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  exploreButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
})