export type BookSource = 'gutenberg' | 'open_library' | 'standard_ebooks' | 'imported'

export interface Book {
  external_id: string | null
  source: BookSource
  title: string
  author: string
  cover_url: string | null
  epub_url: string | null
}

export interface LibraryItem {
  id: number
  external_id: string | null
  source: BookSource
  title: string
  author: string
  cover_url: string | null
  epub_url: string | null
  created_at: string
}

export interface ReadingProgress {
  id: number
  library_item_id: number
  current_chapter: number
  position_seconds: number
  completed: boolean
  last_read_at: string | null
}

export interface EpubChunk {
  chunk_index: number
  text: string
}

export interface EpubChapter {
  chapter_index: number
  title: string
  chunks: EpubChunk[]
}