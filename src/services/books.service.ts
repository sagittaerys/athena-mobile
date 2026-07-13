import { apiRequest } from '@/shared/utils/api'
import type { Book, LibraryItem, EpubChapter } from '@/shared/types/book'


interface BooksResponse {
  books: Book[]
}

interface GenresResponse {
  genres: string[]
}

interface LibraryItemsResponse {
  library_items: LibraryItem[]
}

interface LibraryItemResponse {
  library_item: LibraryItem
}

interface ParseEpubResponse {
  chapters: EpubChapter[]
}

export const BooksService = {
  async search(params: {
    query?: string
    genre?: string
    page?: number
  }): Promise<Book[]> {
    const searchParams = new URLSearchParams()
    if (params.query) searchParams.set('query', params.query)
    if (params.genre) searchParams.set('genre', params.genre)
    if (params.page) searchParams.set('page', String(params.page))

    const data = await apiRequest<BooksResponse>(
      `/api/v1/books?${searchParams.toString()}`
    )
    return data.books
  },

  async getGenres(): Promise<string[]> {
    const data = await apiRequest<GenresResponse>('/api/v1/books/genres')
    return data.genres
  },

  async getBook(id: string, source: string): Promise<Book> {
    const data = await apiRequest<{ book: Book }>(
      `/api/v1/books/${id}?source=${source}`
    )
    return data.book
  },
}

export const LibraryService = {
  async getLibrary(): Promise<LibraryItem[]> {
    const data = await apiRequest<LibraryItemsResponse>('/api/v1/library_items')
    return data.library_items
  },

  async addBook(book: Omit<Book, 'epub_url'> & { epub_url?: string | null }): Promise<LibraryItem> {
    const data = await apiRequest<LibraryItemResponse>('/api/v1/library_items', {
      method: 'POST',
      body: JSON.stringify(book),
    })
    return data.library_item
  },

  async removeBook(id: number): Promise<void> {
    await apiRequest(`/api/v1/library_items/${id}`, {
      method: 'DELETE',
    })
  },

  async parseEpub(libraryItemId: number): Promise<EpubChapter[]> {
    const data = await apiRequest<ParseEpubResponse>(
      `/api/v1/library_items/${libraryItemId}/parse_epub`,
      { method: 'POST' }
    )
    return data.chapters
  },
}