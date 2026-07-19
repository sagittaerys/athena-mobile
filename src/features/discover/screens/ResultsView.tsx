import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { BookOpen } from 'lucide-react-native'
import { DiscoverBookCard } from '@/features/discover/components/DiscoverBookCard'
import { DiscoverHeader } from '@/features/discover/components/DiscoverHeader'
import { MiniPlayer } from '@/shared/components/MiniPlayer'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing } from '@/shared/constants/spacing'
import { DISCOVER_PADDING } from '@/features/discover/constants'
import type { Book } from '@/shared/types/book'

interface ResultsViewProps {
  books: Book[]
  searchQuery: string
  selectedGenre: string | null
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  libraryExternalIds: Set<string | null>
  onSearch: (text: string) => void
  onBack: () => void
  onBookPress: (book: Book) => void
  onLoadMore: () => void
  bottomPadding: number
  theme: Theme
}

export function ResultsView({
  books, searchQuery, selectedGenre, isLoading, isLoadingMore, hasMore,
  libraryExternalIds, onSearch, onBack, onBookPress, onLoadMore, bottomPadding, theme,
}: ResultsViewProps) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={books}
        keyExtractor={item => `${item.source}-${item.external_id}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <DiscoverBookCard
            item={item}
            index={index}
            onPress={() => onBookPress(item)}
            isInLibrary={libraryExternalIds.has(item.external_id)}
            theme={theme}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <DiscoverHeader
              title="Discover"
              showBack
              onBack={onBack}
              searchValue={searchQuery}
              onSearchChange={onSearch}
              theme={theme}
            />
            {selectedGenre && (
              <Text style={[styles.resultsHeading, { color: theme.text }]}>{selectedGenre}</Text>
            )}
            {!isLoading && books.length > 0 && (
              <Text style={[styles.resultsCount, { color: theme.textTertiary }]}>
                {books.length} books
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.text} size="large" />
            </View>
          ) : (
            <Animated.View entering={FadeIn} style={styles.emptyContainer}>
              <BookOpen size={40} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? `No results for "${searchQuery}"` : 'No books found'}
              </Text>
              <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
                Try a different search or genre.
              </Text>
            </Animated.View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={theme.textTertiary} />
            </View>
          ) : null
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={() => {
          if (hasMore && !isLoadingMore) onLoadMore()
        }}
        onEndReachedThreshold={0.5}
      />
      <MiniPlayer />
    </View>
  )
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: DISCOVER_PADDING, paddingTop: 60, flexGrow: 1 },
  header: { gap: Spacing.lg, marginBottom: Spacing.xl },
  resultsHeading: { fontFamily: FontFamily.bold, fontSize: FontSize.xl },
  resultsCount: { fontFamily: FontFamily.regular, fontSize: FontSize.xs },
  row: { justifyContent: 'space-between', marginBottom: Spacing.md },
  loadingContainer: { paddingTop: Spacing.xxxl * 2, alignItems: 'center', justifyContent: 'center' },
  loadingMore: { paddingVertical: Spacing.xl, alignItems: 'center' },
  emptyContainer: { paddingTop: Spacing.xxxl * 2, alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, textAlign: 'center' },
  emptyBody: { fontFamily: FontFamily.regular, fontSize: FontSize.md, textAlign: 'center', lineHeight: FontSize.md * 1.6 },
})