import { createSignal, createMemo } from 'solid-js'
import type { Note, Category, Tag } from '../types'

export const [notes, setNotes] = createSignal<Note[]>([])
export const [categories, setCategories] = createSignal<Category[]>([])
export const [tags, setTags] = createSignal<Tag[]>([])
export const [selectedNote, setSelectedNote] = createSignal<Note | null>(null)
export const [searchQuery, setSearchQuery] = createSignal('')

export const filteredNotes = createMemo(() => {
  const query = searchQuery().toLowerCase()
  if (!query) return notes()
  
  return notes().filter(note => 
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query) ||
    note.tags.some(tag => tag.toLowerCase().includes(query))
  )
})

export const pinnedNotes = createMemo(() => 
  notes().filter(note => note.isPinned)
)

export const floatingNotes = createMemo(() => 
  notes().filter(note => note.isFloating)
)

export function createNote(title: string, content: string = ''): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    title: title || 'Untitled Note',
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    isPinned: false,
    isFloating: false
  }
  
  setNotes(prev => [note, ...prev])
  return note
}

export function updateNote(id: string, updates: Partial<Note>) {
  setNotes(prev => prev.map(note => 
    note.id === id 
      ? { ...note, ...updates, updatedAt: new Date() }
      : note
  ))
}

export function deleteNote(id: string) {
  setNotes(prev => prev.filter(note => note.id !== id))
  if (selectedNote()?.id === id) {
    setSelectedNote(null)
  }
}

export function togglePinNote(id: string) {
  updateNote(id, { isPinned: !notes().find(n => n.id === id)?.isPinned })
}

export function createCategory(name: string, color: string = '#6B7280'): Category {
  const category: Category = {
    id: crypto.randomUUID(),
    name,
    color,
    createdAt: new Date()
  }
  
  setCategories(prev => [...prev, category])
  return category
}

export function createTag(name: string, color: string = '#6B7280'): Tag {
  const existingTag = tags().find(t => t.name.toLowerCase() === name.toLowerCase())
  if (existingTag) return existingTag
  
  const tag: Tag = {
    id: crypto.randomUUID(),
    name,
    color,
    usageCount: 0
  }
  
  setTags(prev => [...prev, tag])
  return tag
}

export function addTagToNote(noteId: string, tagName: string) {
  const tag = createTag(tagName)
  updateNote(noteId, {
    tags: [...(notes().find(n => n.id === noteId)?.tags || []), tag.name]
  })
  
  setTags(prev => prev.map(t => 
    t.id === tag.id ? { ...t, usageCount: t.usageCount + 1 } : t
  ))
}