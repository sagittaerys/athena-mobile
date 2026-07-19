import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useDiscoverStore } from '@/features/discover/store/discoverStore'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { BrowseView } from '@/features/discover/screens/BrowseView'
import { ResultsView } from '@/features/discover/screens/ResultsView'
import { useTheme } from '@/shared/hooks/useTheme'
import type { Book } from '@/shared/types/book'

export default function DiscoverScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [view, setView] = useState<'browse' | 'results'>('browse')

  const {
    books, genres, genreCovers, selectedGenre, searchQuery,
    isLoading, isLoadingMore, isLoadingGenres, hasMore,
    searchBooks, loadMoreBooks, fetchGenres, fetchGenreCovers, primeGenre,
    setGenre, setQuery, resetToBrowse,
  } = useDiscoverStore()

  const { items: libraryItems } = useLibraryStore()
  const libraryExternalIds = useMemo(
    () => new Set(libraryItems.map(i => i.external_id)),
    [libraryItems]
  )

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    if (genres.length > 0) fetchGenreCovers()
  }, [genres])

  const handleSearch = useCallback((text: string) => {
    setQuery(text)
    if (text.length === 0) {
      setView('browse')
      return
    }
    setView('results')
    searchBooks(text, selectedGenre ?? undefined)
  }, [selectedGenre, setQuery, searchBooks])

  const handleGenrePress = useCallback((genre: string) => {
    setGenre(genre)
    setView('results')
    primeGenre(genre)
    searchBooks(searchQuery, genre)
  }, [searchQuery, setGenre, primeGenre, searchBooks])

  const handleBack = useCallback(() => {
    setView('browse')
    resetToBrowse()
  }, [resetToBrowse])

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

  const bottomPadding = 80 + (insets.bottom || 0)

  if (view === 'browse') {
    return (
      <BrowseView
        genres={genres}
        genreCovers={genreCovers}
        isLoadingGenres={isLoadingGenres}
        onSearch={handleSearch}
        onGenrePress={handleGenrePress}
        bottomPadding={bottomPadding}
        theme={theme}
      />
    )
  }

  return (
    <ResultsView
      books={books}
      searchQuery={searchQuery}
      selectedGenre={selectedGenre}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      libraryExternalIds={libraryExternalIds}
      onSearch={handleSearch}
      onBack={handleBack}
      onBookPress={handleBookPress}
      onLoadMore={loadMoreBooks}
      bottomPadding={bottomPadding}
      theme={theme}
    />
  )
}