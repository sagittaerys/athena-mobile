import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { GenreCard } from '@/features/discover/components/GenreCard'
import { DiscoverHeader } from '@/features/discover/components/DiscoverHeader'
import { MiniPlayer } from '@/shared/components/MiniPlayer'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing } from '@/shared/constants/spacing'
import { DISCOVER_PADDING } from '@/features/discover/constants'

interface BrowseViewProps {
  genres: string[]
  genreCovers: Record<string, string | null>
  isLoadingGenres: boolean
  onSearch: (text: string) => void
  onGenrePress: (genre: string) => void
  bottomPadding: number
  theme: Theme
}

export function BrowseView({
  genres, genreCovers, isLoadingGenres, onSearch, onGenrePress, bottomPadding, theme,
}: BrowseViewProps) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={genres}
        keyExtractor={g => g}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <DiscoverHeader title="Discover" searchValue="" onSearchChange={onSearch} theme={theme} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Genre</Text>
          </>
        }
        ListEmptyComponent={
          isLoadingGenres ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.text} size="large" />
            </View>
          ) : null
        }
        renderItem={({ item: genre }) => (
          <GenreCard
            genre={genre}
            coverUrl={genreCovers[genre]}
            onPress={() => onGenrePress(genre)}
            theme={theme}
          />
        )}
      />
      <MiniPlayer />
    </View>
  )
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: DISCOVER_PADDING, paddingTop: 60, flexGrow: 1 },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, marginBottom: Spacing.lg },
  row: { justifyContent: 'space-between', marginBottom: Spacing.md },
  loadingContainer: { paddingTop: Spacing.xxxl * 2, alignItems: 'center', justifyContent: 'center' },
})