import { createSignal, createMemo } from 'solid-js'
import type { Note, Category, Tag } from '../types'
import { notesService } from '../services/notes'

export const [notes, setNotes] = createSignal<Note[]>([])
export const [categories, setCategories] = createSignal<Category[]>([])
export const [tags, setTags] = createSignal<Tag[]>([])
export const [selectedNote, setSelectedNote] = createSignal<Note | null>(null)
export const [searchQuery, setSearchQuery] = createSignal('')
export const [isLoading, setIsLoading] = createSignal(false)
export const [error, setError] = createSignal<string | null>(null)

export const filteredNotes = createMemo(() => {
  const query = searchQuery().toLowerCase()
  let notesToFilter = notes()
  
  // Appliquer d'abord le filtre de recherche
  if (query) {
    notesToFilter = notesToFilter.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  return notesToFilter
})

export const pinnedNotes = createMemo(() => 
  notes().filter(note => note.isPinned)
)

export const floatingNotes = createMemo(() => 
  notes().filter(note => note.isFloating)
)

// Load all notes from backend
export async function loadNotes() {
  setIsLoading(true)
  setError(null)
  
  try {
    const loadedNotes = await notesService.getAllNotes()
    setNotes(loadedNotes)
  } catch (err) {
    console.error('Failed to load notes:', err)
    setError('Failed to load notes')
  } finally {
    setIsLoading(false)
  }
}

// Create a new note
export async function createNote(title: string, content: string = ''): Promise<Note | null> {
  setError(null)
  
  try {
    const note = await notesService.createNote(title, content)
    setNotes(prev => [note, ...prev])
    return note
  } catch (err) {
    console.error('Failed to create note:', err)
    setError('Failed to create note')
    return null
  }
}

// Update note locally (until backend has update command)
export function updateNote(id: string, updates: Partial<Note>) {
  console.log('🔄 updateNote appelé:', { id, updates })
  
  setNotes(prev => prev.map(note => 
    note.id === id 
      ? { ...note, ...updates, updatedAt: new Date() }
      : note
  ))
  
  // TODO: Sync with backend when update command is available
  notesService.updateNote(id, updates)
    .then(() => {
      console.log('✅ Backend sync réussi pour note:', id)
    })
    .catch(err => {
      console.error('❌ Backend sync échoué pour note:', id, err)
    })
}

// Delete note
export function deleteNote(id: string) {
  console.log('deleteNote called with id:', id)
  
  // Delete from backend first
  notesService.deleteNote(id)
    .then(() => {
      console.log('Note deleted from backend successfully')
      // Then update local state
      setNotes(prev => prev.filter(note => note.id !== id))
      if (selectedNote()?.id === id) {
        setSelectedNote(null)
      }
    })
    .catch(err => {
      console.error('Failed to delete note:', err)
    })
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

// Assign selector to note
export function assignSelectorToNote(noteId: string, selectorId: number) {
  console.log('🔧 assignSelectorToNote appelé:', { noteId, selectorId })
  
  // Vérifier que la note existe
  const existingNote = notes().find(n => n.id === noteId)
  if (!existingNote) {
    console.error('❌ Note introuvable:', noteId)
    return
  }
  
  console.log('📝 Note avant update:', { id: existingNote.id, title: existingNote.title, selectorId: existingNote.selectorId })
  
  updateNote(noteId, { selectorId })
  
  // Vérifier après update
  const updatedNote = notes().find(n => n.id === noteId)
  console.log('✅ Note après update:', { id: updatedNote?.id, title: updatedNote?.title, selectorId: updatedNote?.selectorId })
}

// Filter notes by selector
export const filterNotesBySelector = createMemo(() => {
  return (selectorId: number | null) => {
    if (selectorId === null) {
      return notes()
    }
    return notes().filter(note => note.selectorId === selectorId)
  }
})