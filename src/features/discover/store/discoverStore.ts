import { create } from 'zustand'
import { BooksService } from '@/services/books.service'
import type { Book } from '@/shared/types/book'

interface DiscoverState {
  books: Book[]
  genres: string[]
  selectedGenre: string | null
  searchQuery: string
  currentPage: number
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null

  searchBooks: (query?: string, genre?: string) => Promise<void>
  loadMoreBooks: () => Promise<void>
  fetchGenres: () => Promise<void>
  setGenre: (genre: string | null) => void
  setQuery: (query: string) => void
  clearError: () => void
}

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  books: [],
  genres: [],
  selectedGenre: null,
  searchQuery: '',
  currentPage: 1,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,

  searchBooks: async (query, genre) => {
    set({ isLoading: true, error: null, currentPage: 1 })
    try {
      const books = await BooksService.search({
        query: query ?? get().searchQuery,
        genre: genre ?? get().selectedGenre ?? undefined,
        page: 1,
      })
      set({
        books,
        isLoading: false,
        hasMore: books.length === 32,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
      })
    }
  },

  loadMoreBooks: async () => {
    const { isLoadingMore, hasMore, currentPage, searchQuery, selectedGenre } = get()
    if (isLoadingMore || !hasMore) return

    set({ isLoadingMore: true })
    try {
      const nextPage = currentPage + 1
      const books = await BooksService.search({
        query: searchQuery,
        genre: selectedGenre ?? undefined,
        page: nextPage,
      })
      set(state => ({
        books: [...state.books, ...books],
        currentPage: nextPage,
        isLoadingMore: false,
        hasMore: books.length === 32,
      }))
    } catch {
      set({ isLoadingMore: false })
    }
  },

  fetchGenres: async () => {
    try {
      const genres = await BooksService.getGenres()
      set({ genres })
    } catch {}
  },

  setGenre: (genre) => set({ selectedGenre: genre }),
  setQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),
}))