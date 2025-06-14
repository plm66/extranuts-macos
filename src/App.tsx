import { Component, createSignal, onMount, For, Show, createEffect } from 'solid-js'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { TauriEvent } from '@tauri-apps/api/event'
import { 
  notes, 
  selectedNote, 
  setSelectedNote, 
  createNote, 
  updateNote, 
  deleteNote,
  togglePinNote,
  filteredNotes,
  setNotes,
  setCategories,
  setTags
} from './stores/noteStore'
import { storage } from './stores/storage'

const App: Component = () => {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = createSignal(false)
  const [noteTitle, setNoteTitle] = createSignal('')
  const [noteContent, setNoteContent] = createSignal('')
  
  onMount(async () => {
    const currentWindow = getCurrentWindow()
    
    // Load data from storage
    const savedNotes = storage.loadNotes()
    const savedCategories = storage.loadCategories()
    const savedTags = storage.loadTags()
    
    setNotes(savedNotes)
    setCategories(savedCategories)
    setTags(savedTags)
    
    // Listen for window events
    await currentWindow.listen(TauriEvent.WINDOW_FOCUS, () => {
      console.log('Window focused')
    })
    
    // Check if window is always on top
    const alwaysOnTop = await currentWindow.isAlwaysOnTop()
    setIsAlwaysOnTop(alwaysOnTop)
  })

  // Auto-save functionality
  createEffect(() => {
    const noteList = notes()
    if (noteList.length > 0) {
      storage.saveNotes(noteList)
    }
  })
  
  const createFloatingNote = async () => {
    try {
      const note = createNote('New Floating Note')
      updateNote(note.id, { isFloating: true })
      
      await invoke('create_floating_window', {
        label: `note-${note.id}`,
        width: 400,
        height: 300
      })
      
      setSelectedNote(note)
    } catch (error) {
      console.error('Failed to create floating window:', error)
    }
  }

  const createRegularNote = () => {
    const note = createNote('New Note')
    setSelectedNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
  }

  const saveCurrentNote = () => {
    const note = selectedNote()
    if (note) {
      updateNote(note.id, {
        title: noteTitle() || 'Untitled Note',
        content: noteContent()
      })
    }
  }
  
  const toggleAlwaysOnTop = async () => {
    try {
      await invoke('toggle_always_on_top', { window: getCurrentWindow() })
      setIsAlwaysOnTop(!isAlwaysOnTop())
    } catch (error) {
      console.error('Failed to toggle always on top:', error)
    }
  }
  
  const hideToMenuBar = async () => {
    try {
      await invoke('show_in_menu_bar')
    } catch (error) {
      console.error('Failed to hide to menu bar:', error)
    }
  }
  
  return (
    <div class="flex h-screen bg-black/80">
      {/* Sidebar */}
      <div class="w-64 sidebar-glass flex flex-col">
        <div class="p-4 border-b border-macos-border drag-region">
          <h1 class="text-xl font-semibold">Extranuts</h1>
        </div>
        
        <div class="flex-1 p-4 native-scrollbar overflow-y-auto">
          <div class="space-y-2 mb-4">
            <button
              onClick={createRegularNote}
              class="w-full px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
            >
              + New Note
            </button>
            <button
              onClick={createFloatingNote}
              class="w-full px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
            >
              🪟 New Floating Note
            </button>
          </div>
          
          <div class="space-y-2">
            <p class="text-macos-text-secondary text-xs uppercase tracking-wider mb-2">
              Notes ({notes().length})
            </p>
            <For each={notes()} fallback={
              <p class="text-macos-text-secondary text-sm italic">No notes yet</p>
            }>
              {(note) => (
                <div 
                  class={`p-3 rounded-lg cursor-pointer transition-colors no-drag ${
                    selectedNote()?.id === note.id 
                      ? 'bg-macos-hover border border-macos-border' 
                      : 'hover-highlight'
                  }`}
                  onClick={() => {
                    setSelectedNote(note)
                    setNoteTitle(note.title)
                    setNoteContent(note.content)
                  }}
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-medium truncate">
                        {note.isPinned && '📌 '}{note.title}
                      </h3>
                      <p class="text-xs text-macos-text-secondary mt-1 line-clamp-2">
                        {note.content || 'No content'}
                      </p>
                      <p class="text-xs text-macos-text-secondary mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {note.isFloating && (
                      <span class="text-xs bg-macos-border px-1 rounded">Float</span>
                    )}
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
        
        <div class="p-4 border-t border-macos-border space-y-2">
          <button
            onClick={toggleAlwaysOnTop}
            class="w-full px-3 py-1.5 text-sm hover-highlight rounded no-drag"
          >
            {isAlwaysOnTop() ? 'Disable' : 'Enable'} Always on Top
          </button>
          <button
            onClick={hideToMenuBar}
            class="w-full px-3 py-1.5 text-sm hover-highlight rounded no-drag"
          >
            Hide to Menu Bar
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div class="flex-1 flex flex-col">
        <div class="h-8 drag-region border-b border-macos-border" />
        <div class="flex-1 flex flex-col">
          <Show 
            when={selectedNote()} 
            fallback={
              <div class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <h2 class="text-2xl mb-4 text-macos-text-secondary">Welcome to Extranuts</h2>
                  <p class="text-macos-text-secondary mb-6">
                    Select a note or create a new one to get started
                  </p>
                  <button
                    onClick={createRegularNote}
                    class="px-6 py-3 glass-morphism hover-highlight rounded-lg no-drag"
                  >
                    + Create Your First Note
                  </button>
                </div>
              </div>
            }
          >
            <div class="flex-1 flex flex-col p-6">
              {/* Note Editor Header */}
              <div class="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={noteTitle()}
                  onInput={(e) => setNoteTitle(e.target.value)}
                  onBlur={saveCurrentNote}
                  class="text-2xl font-semibold bg-transparent border-none outline-none text-macos-text flex-1 no-drag"
                  placeholder="Note title..."
                />
                <div class="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const note = selectedNote()
                      if (note) togglePinNote(note.id)
                    }}
                    class="p-2 hover-highlight rounded no-drag"
                    title="Pin note"
                  >
                    {selectedNote()?.isPinned ? '📌' : '📍'}
                  </button>
                  <button
                    onClick={() => {
                      const note = selectedNote()
                      if (note && confirm('Delete this note?')) {
                        deleteNote(note.id)
                        setSelectedNote(null)
                        setNoteTitle('')
                        setNoteContent('')
                      }
                    }}
                    class="p-2 hover-highlight rounded text-red-400 no-drag"
                    title="Delete note"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Note Editor */}
              <textarea
                value={noteContent()}
                onInput={(e) => setNoteContent(e.target.value)}
                onBlur={saveCurrentNote}
                class="flex-1 bg-transparent border-none outline-none text-macos-text resize-none no-drag native-scrollbar"
                placeholder="Start writing..."
              />
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default App