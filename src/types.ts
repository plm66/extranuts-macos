export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  categoryId?: string
  selectorId?: number
  tags: string[]
  isPinned: boolean
  isFloating: boolean
  floatingWindowId?: string
}

export interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  usageCount: number
}

export interface AppSettings {
  defaultWindowSize: { width: number; height: number }
  floatingWindowOpacity: number
  theme: 'dark' | 'light' | 'system'
  autoSave: boolean
  globalShortcuts: {
    newNote: string
    search: string
    newFloatingNote: string
  }
}

export interface NoteWindow {
  id: string
  noteId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isAlwaysOnTop: boolean
}