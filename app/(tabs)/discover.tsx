import { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { Search, X, BookOpen, Check } from 'lucide-react-native'
import { useDiscoverStore } from '@/features/discover/store/discoverStore'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { MiniPlayer } from '@/shared/components/MiniPlayer'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import type { Book } from '@/shared/types/book'

const { width } = Dimensions.get('window')
const COLUMN_GAP = Spacing.md
const PADDING = Spacing.xl
const CARD_WIDTH = (width - PADDING * 2 - COLUMN_GAP) / 2

function GenrePill({
  genre,
  isSelected,
  onPress,
  theme,
}: {
  genre: string
  isSelected: boolean
  onPress: () => void
  theme: Theme
}) {
  return (
    <Pressable
      style={[
        styles.genrePill,
        {
          backgroundColor: isSelected ? theme.text : theme.backgroundSecondary,
          borderColor: isSelected ? theme.text : theme.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.genreText, { color: isSelected ? theme.background : theme.textSecondary }]}>
        {genre}
      </Text>
    </Pressable>
  )
}

function DiscoverBookCard({
  item,
  index,
  onPress,
  isInLibrary,
  theme,
}: {
  item: Book
  index: number
  onPress: () => void
  isInLibrary: boolean
  theme: Theme
}) {
  const placeholderColor = [
    '#C9B99A', '#A8B5C2', '#B5C4A8', '#C4A8B5', '#A8C4C0',
  ][index % 5]

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <Pressable style={styles.bookCard} onPress={onPress}>
        <View>
          {item.cover_url ? (
            <Image
              source={{ uri: item.cover_url }}
              style={[styles.bookCover, { backgroundColor: theme.backgroundSecondary }]}
              contentFit="cover"
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

          {isInLibrary && (
            <View style={[styles.inLibraryBadge, { backgroundColor: theme.text }]}>
              <Check size={12} color={theme.background} />
            </View>
          )}
        </View>

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

function EmptyResults({ query, theme }: { query: string; theme: Theme }) {
  return (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <Search size={40} color={theme.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {query ? `No results for "${query}"` : 'No books found'}
      </Text>
      <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
        Try a different search or browse by genre.
      </Text>
    </Animated.View>
  )
}

export default function DiscoverScreen() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const insets = useSafeAreaInsets()

  const {
    books,
    genres,
    selectedGenre,
    searchQuery,
    isLoading,
    isLoadingMore,
    hasMore,
    searchBooks,
    loadMoreBooks,
    fetchGenres,
    setGenre,
    setQuery,
  } = useDiscoverStore()

  const { items: libraryItems } = useLibraryStore()
  const libraryExternalIds = new Set(libraryItems.map(i => i.external_id))

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchGenres()
    searchBooks()
  }, [])

  const handleSearchChange = useCallback((text: string) => {
    setQuery(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      searchBooks(text, selectedGenre ?? undefined)
    }, 400)
  }, [selectedGenre, setQuery, searchBooks])

  const handleGenrePress = useCallback((genre: string) => {
    const next = selectedGenre === genre ? null : genre
    setGenre(next)
    searchBooks(searchQuery, next ?? undefined)
  }, [selectedGenre, searchQuery, setGenre, searchBooks])

  const handleBookPress = useCallback((book: Book) => {
    router.push({
      pathname: '/book/[id]',
      params: {
        id: book.external_id ?? '',
        source: book.source,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url ?? '',
        epub_url: book.epub_url ?? '',
      },
    })
  }, [])

  const renderBook = useCallback(
    ({ item, index }: { item: Book; index: number }) => (
      <DiscoverBookCard
        item={item}
        index={index}
        onPress={() => handleBookPress(item)}
        isInLibrary={libraryExternalIds.has(item.external_id)}
        theme={theme}
      />
    ),
    [theme, libraryExternalIds, handleBookPress]
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Discover</Text>

      <View style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <Search size={16} color={theme.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search books, authors..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearchChange('')} hitSlop={8}>
            <X size={16} color={theme.textTertiary} />
          </Pressable>
        )}
      </View>

      {genres.length > 0 && (
        <FlatList
          data={genres}
          keyExtractor={g => g}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
          renderItem={({ item: genre }) => (
            <GenrePill
              genre={genre}
              isSelected={selectedGenre === genre}
              onPress={() => handleGenrePress(genre)}
              theme={theme}
            />
          )}
        />
      )}

      {!isLoading && books.length > 0 && (
        <Text style={[styles.resultsCount, { color: theme.textTertiary }]}>
          {books.length} books{selectedGenre ? ` in ${selectedGenre}` : ''}
        </Text>
      )}
    </View>
  )

  const renderFooter = () => {
    if (!isLoadingMore) return null
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={theme.textTertiary} />
      </View>
    )
  }

  const bottomPadding = 80 + (insets.bottom || 0)

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isLoading && books.length === 0 ? (
        <>
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.text} size="large" />
          </View>
        </>
      ) : (
        <FlatList
          data={books}
          keyExtractor={item => `${item.source}-${item.external_id}`}
          renderItem={renderBook}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={!isLoading ? <EmptyResults query={searchQuery} theme={theme} /> : null}
          ListFooterComponent={renderFooter}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasMore && !isLoadingMore) loadMoreBooks()
          }}
          onEndReachedThreshold={0.5}
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
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    height: '100%',
  },
  genreList: {
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  genrePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  genreText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  resultsCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
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
  inLibraryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: { gap: 3 },
  bookTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  bookAuthor: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMore: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: Spacing.xxxl * 2,
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
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
})