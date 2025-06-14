import type { Note, Category, Tag, AppSettings } from '../types'

const STORAGE_KEYS = {
  NOTES: 'extranuts_notes',
  CATEGORIES: 'extranuts_categories', 
  TAGS: 'extranuts_tags',
  SETTINGS: 'extranuts_settings'
}

class Storage {
  private serialize(data: any): string {
    return JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() }
      }
      return value
    })
  }

  private deserialize(data: string): any {
    return JSON.parse(data, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value)
      }
      return value
    })
  }

  saveNotes(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, this.serialize(notes))
  }

  loadNotes(): Note[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES)
    return data ? this.deserialize(data) : []
  }

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, this.serialize(categories))
  }

  loadCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? this.deserialize(data) : []
  }

  saveTags(tags: Tag[]): void {
    localStorage.setItem(STORAGE_KEYS.TAGS, this.serialize(tags))
  }

  loadTags(): Tag[] {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS)
    return data ? this.deserialize(data) : []
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, this.serialize(settings))
  }

  loadSettings(): AppSettings | null {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? this.deserialize(data) : null
  }

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

export const storage = new Storage()

export const defaultSettings: AppSettings = {
  defaultWindowSize: { width: 400, height: 300 },
  floatingWindowOpacity: 0.85,
  theme: 'dark',
  autoSave: true,
  globalShortcuts: {
    newNote: 'Cmd+Shift+N',
    search: 'Cmd+Shift+F', 
    newFloatingNote: 'Cmd+N'
  }
}