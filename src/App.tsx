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
import { createFullBackup } from './utils/backup'

const App: Component = () => {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = createSignal(false)
  const [noteTitle, setNoteTitle] = createSignal('')
  const [noteContent, setNoteContent] = createSignal('')
  const [editorHeight, setEditorHeight] = createSignal(60) // percentage
  
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

  // Auto-save functionality with backup
  createEffect(() => {
    const noteList = notes()
    if (noteList.length > 0) {
      storage.saveNotes(noteList)
      
      // Also create backup every 10 notes or every hour
      const now = Date.now()
      const lastBackup = localStorage.getItem('lastAutoBackup')
      const oneHour = 60 * 60 * 1000
      
      if (!lastBackup || (now - parseInt(lastBackup)) > oneHour) {
        console.log('🔄 Creating automatic backup...')
        localStorage.setItem('lastAutoBackup', now.toString())
        
        // Silent backup to localStorage as additional safety
        const backupData = {
          notes: noteList,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
        localStorage.setItem('extranuts_emergency_backup', JSON.stringify(backupData))
      }
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
    // Focus title field after creating note
    setTimeout(() => {
      const titleInput = document.querySelector('input[placeholder="Note title..."]') as HTMLInputElement
      if (titleInput) {
        titleInput.focus()
        titleInput.select() // Select all text so user can immediately type
      }
    }, 100)
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

  const handleResizeStart = (e: MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = editorHeight()
    
    const handleResize = (e: MouseEvent) => {
      const deltaY = e.clientY - startY
      const containerHeight = window.innerHeight - 64 // minus header height
      const deltaPercentage = (deltaY / containerHeight) * 100
      const newHeight = Math.max(20, Math.min(80, startHeight + deltaPercentage))
      setEditorHeight(newHeight)
    }
    
    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', handleResizeEnd)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
    
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', handleResizeEnd)
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }

  
  return (
    <div class="flex flex-col h-screen bg-black/80">
      {/* Top Header */}
      <div class="h-16 sidebar-glass flex items-center justify-between px-6 border-b border-macos-border drag-region">
        <h1 class="text-xl font-semibold">Extranuts</h1>
        
        <div class="flex items-center space-x-2">
          <button
            onClick={createRegularNote}
            class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
          >
            + New Note
          </button>
          <button
            onClick={createFloatingNote}
            class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
          >
            🪟 Float
          </button>
          <button
            onClick={toggleAlwaysOnTop}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
          >
            {isAlwaysOnTop() ? '📌' : '📍'}
          </button>
          <button
            onClick={hideToMenuBar}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
          >
            Hide
          </button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div class="flex flex-col" style={{ height: `${editorHeight()}%` }}>
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
              {/* Title Field */}
              <div class="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={noteTitle()}
                  onInput={(e) => setNoteTitle(e.target.value)}
                  onBlur={saveCurrentNote}
                  class="flex-1 text-2xl font-semibold bg-transparent border-none outline-none text-macos-text no-drag mr-4"
                  placeholder="Note title..."
                  ref={(el) => {
                    // Auto-focus title when note is selected
                    if (el && selectedNote()) {
                      setTimeout(() => el.focus(), 100)
                    }
                  }}
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
              
              {/* Content Editor */}
              <textarea
                value={noteContent()}
                onInput={(e) => setNoteContent(e.target.value)}
                onBlur={saveCurrentNote}
                class="flex-1 bg-transparent border-none outline-none text-macos-text resize-none no-drag native-scrollbar leading-relaxed"
                placeholder="Start writing your note content..."
                style={{
                  "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  "line-height": "1.6"
                }}
              />
            </div>
          </Show>
        </div>
      </div>
      
      {/* Resize Handle */}
      <div 
        class="h-1 bg-macos-border hover:bg-blue-500/50 cursor-ns-resize transition-colors no-drag"
        onMouseDown={handleResizeStart}
        title="Drag to resize editor"
      />
      
      {/* Bottom Notes List - nvALT Style */}
      <div class="flex-1 sidebar-glass border-t border-macos-border">
        <div class="p-4 h-full">
          <p class="text-macos-text-secondary text-xs uppercase tracking-wider mb-3">
            Notes ({notes().length})
          </p>
          
          <div class="space-y-1 max-h-36 overflow-y-auto native-scrollbar">
            <For each={notes()} fallback={
              <p class="text-macos-text-secondary text-sm italic py-4">No notes yet</p>
            }>
              {(note) => (
                <div 
                  class={`w-full p-2 rounded cursor-pointer transition-colors no-drag text-left ${
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
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold truncate">
                        {note.isPinned && '📌 '}{note.title}
                      </div>
                      <div class="text-xs text-macos-text-secondary truncate mt-1">
                        {note.content.split('\n')[0] || 'Empty note'}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-2">
                      {note.isFloating && (
                        <span class="text-xs bg-macos-border px-1 rounded">Float</span>
                      )}
                      <span class="text-xs text-macos-text-secondary">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App