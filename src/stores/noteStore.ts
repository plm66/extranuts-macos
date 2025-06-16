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
  console.log('🚀 DAVE DEBUG: loadNotes appelée');
  setIsLoading(true)
  setError(null)
  
  try {
    console.log('🚀 DAVE DEBUG: Appel de notesService.getAllNotes...');
    const loadedNotes = await notesService.getAllNotes()
    console.log('🚀 DAVE DEBUG: Notes chargées du backend:', loadedNotes.length);
    console.log('🚀 DAVE DEBUG: Détail des notes:', loadedNotes.map(n => ({ id: n.id, title: n.title })));
    setNotes(loadedNotes)
    console.log('🚀 DAVE DEBUG: Signal notes() mis à jour:', notes().length);
  } catch (err) {
    console.error('❌ DAVE DEBUG: Failed to load notes:', err)
    setError('Failed to load notes')
  } finally {
    setIsLoading(false)
  }
}

// Create a new note
export async function createNote(title: string, content: string = ''): Promise<Note | null> {
  console.log('🚀 JOHN: createNote dans noteStore appelée');
  console.log('🚀 JOHN: Paramètres:', { title, content });
  setError(null)
  
  try {
    console.log('🚀 JOHN: Appel de notesService.createNote...');
    const note = await notesService.createNote(title, content)
    console.log('🚀 JOHN: Note créée par le service:', note);
    
    // JOHN: Refresh automatique depuis la DB - pattern "action + refresh"
    console.log('🔄 JOHN: Refresh automatique après createNote...');
    await loadNotes()
    console.log('✅ JOHN: Refresh terminé, notes():', notes().length);
    
    return note
  } catch (err) {
    console.error('❌ JOHN: Failed to create note:', err)
    setError('Failed to create note')
    return null
  }
}

// Update note with automatic refresh
export async function updateNote(id: string, updates: Partial<Note>) {
  console.log('🔄 JOHN: updateNote appelé:', { id, updates })
  console.log('🔄 JOHN: Mise à jour de selectorId?', 'selectorId' in updates, updates.selectorId)
  
  setError(null)
  
  try {
    // JOHN: D'abord synchroniser avec le backend
    console.log('🔄 JOHN: Synchronisation avec le backend...')
    await notesService.updateNote(id, updates)
    console.log('✅ JOHN: Backend sync réussi pour note:', id)
    
    // JOHN: Refresh automatique depuis la DB - pattern "action + refresh"
    console.log('🔄 JOHN: Refresh automatique après updateNote...')
    await loadNotes()
    console.log('✅ JOHN: Refresh terminé, vérification de la mise à jour')
    
    // Debug: Vérifier la mise à jour
    const updatedNote = notes().find(n => n.id === id)
    console.log('✅ JOHN: Note après refresh:', { 
      id: updatedNote?.id, 
      title: updatedNote?.title, 
      selectorId: updatedNote?.selectorId 
    })
  } catch (err) {
    console.error('❌ JOHN: Failed to update note:', err)
    setError('Failed to update note')
  }
}

// Delete note with automatic refresh
export async function deleteNote(id: string) {
  console.log('🗑️ JOHN: deleteNote appelé avec id:', id)
  setError(null)
  
  try {
    // JOHN: D'abord supprimer du backend
    console.log('🗑️ JOHN: Suppression du backend...')
    await notesService.deleteNote(id)
    console.log('✅ JOHN: Note supprimée du backend avec succès')
    
    // JOHN: Si la note sélectionnée est supprimée, la désélectionner
    if (selectedNote()?.id === id) {
      setSelectedNote(null)
    }
    
    // JOHN: Refresh automatique depuis la DB - pattern "action + refresh"
    console.log('🔄 JOHN: Refresh automatique après deleteNote...')
    await loadNotes()
    console.log('✅ JOHN: Refresh terminé, notes():', notes().length)
  } catch (err) {
    console.error('❌ JOHN: Failed to delete note:', err)
    setError('Failed to delete note')
  }
}

export async function togglePinNote(id: string) {
  const note = notes().find(n => n.id === id)
  if (note) {
    await updateNote(id, { isPinned: !note.isPinned })
  }
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

export async function addTagToNote(noteId: string, tagName: string) {
  const tag = createTag(tagName)
  const note = notes().find(n => n.id === noteId)
  if (!note) return
  
  await updateNote(noteId, {
    tags: [...(note.tags || []), tag.name]
  })
  
  setTags(prev => prev.map(t => 
    t.id === tag.id ? { ...t, usageCount: t.usageCount + 1 } : t
  ))
}

// Assign selector to note with automatic refresh
export async function assignSelectorToNote(noteId: string, selectorId: number) {
  console.log('🔧 JOHN: assignSelectorToNote appelé:', { noteId, selectorId })
  
  // JOHN: Vérifier que la note existe
  const existingNote = notes().find(n => n.id === noteId)
  if (!existingNote) {
    console.error('❌ JOHN: Note introuvable:', noteId)
    return
  }
  
  console.log('📝 JOHN: Note avant update:', { 
    id: existingNote.id, 
    title: existingNote.title, 
    selectorId: existingNote.selectorId 
  })
  
  // JOHN: Utiliser la version asynchrone de updateNote qui fait le refresh automatique
  await updateNote(noteId, { selectorId })
  
  // JOHN: La vérification après update sera faite dans updateNote
  console.log('✅ JOHN: assignSelectorToNote terminé')
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