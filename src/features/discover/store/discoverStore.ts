// features/discover/store/discoverStore.ts
import { create } from 'zustand'
import { BooksService } from '@/services/books.service'
import type { Book } from '@/shared/types/book'

const PAGE_SIZE = 20

interface DiscoverState {
  books: Book[]
  genres: string[]
  genreCovers: Record<string, string | null>
  genreBooksCache: Record<string, Book[]>
  selectedGenre: string | null
  searchQuery: string
  page: number
  isLoading: boolean
  isLoadingMore: boolean
  isLoadingGenres: boolean
  hasMore: boolean
  error: string | null

  searchBooks: (query?: string, genre?: string) => Promise<void>
  loadMoreBooks: () => Promise<void>
  fetchGenres: () => Promise<void>
  fetchGenreCovers: () => Promise<void>
  primeGenre: (genre: string) => void
  setGenre: (genre: string | null) => void
  setQuery: (query: string) => void
  resetToBrowse: () => void
}

// Module-level, not store state — used purely to detect and drop stale responses
let searchRequestId = 0

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  books: [],
  genres: [],
  genreCovers: {},
  genreBooksCache: {},
  selectedGenre: null,
  searchQuery: '',
  page: 1,
  isLoading: false,
  isLoadingMore: false,
  isLoadingGenres: false,
  hasMore: true,
  error: null,

  searchBooks: async (query, genre) => {
    const requestId = ++searchRequestId
    set({ isLoading: true, error: null, page: 1 })
    try {
      const books = await BooksService.search({ query, genre, page: 1 })
      if (requestId !== searchRequestId) return // a newer request already superseded this one
      set({ books, isLoading: false, hasMore: books.length >= PAGE_SIZE, page: 1 })
    } catch (error) {
      if (requestId !== searchRequestId) return
      set({
        error: error instanceof Error ? error.message : 'Failed to search books',
        isLoading: false,
      })
    }
  },

  loadMoreBooks: async () => {
    const { page, searchQuery, selectedGenre, books, isLoadingMore, hasMore } = get()
    if (isLoadingMore || !hasMore) return

    set({ isLoadingMore: true })
    try {
      const nextPage = page + 1
      const more = await BooksService.search({
        query: searchQuery || undefined,
        genre: selectedGenre ?? undefined,
        page: nextPage,
      })
      set({
        books: [...books, ...more],
        page: nextPage,
        hasMore: more.length >= PAGE_SIZE,
        isLoadingMore: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load more books',
        isLoadingMore: false,
      })
    }
  },

  fetchGenres: async () => {
    set({ isLoadingGenres: true })
    try {
      const genres = await BooksService.getGenres()
      set({ genres, isLoadingGenres: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch genres',
        isLoadingGenres: false,
      })
    }
  },

  fetchGenreCovers: async () => {
    const { genres, genreBooksCache } = get()
    const missing = genres.filter(g => !(g in genreBooksCache))
    if (missing.length === 0) return

    const results = await Promise.allSettled(
      missing.map(async genre => {
        const books = await BooksService.search({ genre, page: 1 })
        return { genre, books }
      })
    )

    const bookUpdates: Record<string, Book[]> = {}
    const coverUpdates: Record<string, string | null> = {}
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        bookUpdates[result.value.genre] = result.value.books
        coverUpdates[result.value.genre] = result.value.books[0]?.cover_url ?? null
      }
    })

    set(state => ({
      genreBooksCache: { ...state.genreBooksCache, ...bookUpdates },
      genreCovers: { ...state.genreCovers, ...coverUpdates },
    }))
  },

  
  primeGenre: (genre) => {
    const cached = get().genreBooksCache[genre]
    if (cached && cached.length > 0) {
      set({ books: cached, hasMore: cached.length >= PAGE_SIZE, page: 1 })
    }
  },

  setGenre: genre => set({ selectedGenre: genre }),
  setQuery: query => set({ searchQuery: query }),

  resetToBrowse: () => set({ selectedGenre: null, searchQuery: '', books: [] }),
}))