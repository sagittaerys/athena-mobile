import { create } from 'zustand'
import { LibraryService } from '@/services/books.service'
import type { Book, LibraryItem, EpubChapter } from '@/shared/types/book'

interface LibraryState {
  items: LibraryItem[]
  currentChapters: EpubChapter[]
  isLoading: boolean
  error: string | null

  fetchLibrary: () => Promise<void>
  addBook: (book: Omit<Book, 'epub_url'> & { epub_url?: string | null }) => Promise<LibraryItem>
  removeBook: (id: number) => Promise<void>
  parseEpub: (libraryItemId: number) => Promise<EpubChapter[]>
  clearError: () => void
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  items: [],
  currentChapters: [],
  isLoading: false,
  error: null,

  fetchLibrary: async () => {
    set({ isLoading: true, error: null })
    try {
      const items = await LibraryService.getLibrary()
      set({ items, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch library',
        isLoading: false,
      })
    }
  },

  addBook: async (book) => {
    try {
      const newItem = await LibraryService.addBook(book)
      set(state => ({ items: [newItem, ...state.items] }))
      return newItem
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add book' })
      throw error
    }
  },

  removeBook: async (id) => {
    try {
      await LibraryService.removeBook(id)
      set(state => ({ items: state.items.filter(item => item.id !== id) }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove book' })
      throw error
    }
  },

  parseEpub: async (libraryItemId) => {
    set({ isLoading: true })
    try {
      const chapters = await LibraryService.parseEpub(libraryItemId)
      set({ currentChapters: chapters, isLoading: false })
      return chapters
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to parse EPUB',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))