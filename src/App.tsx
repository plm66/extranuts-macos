import { Component, createSignal, onMount, For, Show, createEffect } from 'solid-js'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { TauriEvent } from '@tauri-apps/api/event'
import { Icon } from '@iconify-icon/solid'
import { 
  notes, 
  selectedNote, 
  setSelectedNote, 
  createNote, 
  updateNote, 
  deleteNote,
  togglePinNote,
  filteredNotes,
  loadNotes,
  isLoading,
  error
} from './stores/noteStore'
import { preferences, loadPreferences, toggleDeleteConfirmation } from './stores/preferencesStore'
import { createFullBackup } from './utils/backup'
import { parseWikiLinks, getAutoCompleteMatches, findWikiLinkAtCursor } from './utils/wikilinks'
import SettingsPanel from './components/SettingsPanel'
import ExportModal from './components/ExportModal'
import CategorySelector from './components/CategorySelector'
import { categoriesService } from './services/categories'

// WikiLink Renderer Component
const WikiLinkRenderer: Component<{
  content: string
  noteList: Array<{ title: string; id: string }>
  onLinkClick: (noteTitle: string, exists: boolean) => void
}> = (props) => {
  const renderContent = () => {
    const parsed = parseWikiLinks(props.content, props.noteList)
    
    if (parsed.links.length === 0) {
      return <pre class="whitespace-pre-wrap font-sans text-macos-text">{props.content}</pre>
    }
    
    const elements: any[] = []
    let lastIndex = 0
    
    parsed.links.forEach((link, i) => {
      // Add text before the link
      if (link.startIndex > lastIndex) {
        const textBefore = props.content.slice(lastIndex, link.startIndex)
        elements.push(<span key={`text-${i}`}>{textBefore}</span>)
      }
      
      // Add the clickable link
      const displayText = link.displayText || link.noteTitle
      const className = link.exists ? 'wikilink-exists' : 'wikilink-missing'
      
      elements.push(
        <span 
          key={`link-${i}`}
          class={className}
          onClick={() => props.onLinkClick(link.noteTitle, link.exists)}
        >
          {displayText}
        </span>
      )
      
      lastIndex = link.endIndex
    })
    
    // Add remaining text after the last link
    if (lastIndex < props.content.length) {
      const textAfter = props.content.slice(lastIndex)
      elements.push(<span key="text-end">{textAfter}</span>)
    }
    
    return <pre class="whitespace-pre-wrap font-sans text-macos-text">{elements}</pre>
  }
  
  return <div>{renderContent()}</div>
}

const App: Component = () => {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = createSignal(false)
  const [noteTitle, setNoteTitle] = createSignal('')
  const [noteContent, setNoteContent] = createSignal('')
  const [editorHeight, setEditorHeight] = createSignal(60) // percentage
  const [currentTime, setCurrentTime] = createSignal(new Date())
  const [lastSaved, setLastSaved] = createSignal<Date | null>(null)
  const [showAutoComplete, setShowAutoComplete] = createSignal(false)
  const [autoCompleteResults, setAutoCompleteResults] = createSignal<Array<{ title: string; id: string }>>([])
  const [autoCompletePosition, setAutoCompletePosition] = createSignal({ top: 0, left: 0 })
  const [showPreview, setShowPreview] = createSignal(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false)
  const [noteToDelete, setNoteToDelete] = createSignal<string | null>(null)
  const [showSettings, setShowSettings] = createSignal(false)
  const [showExportModal, setShowExportModal] = createSignal(false)
  const [availableCategories, setAvailableCategories] = createSignal<Array<{id: number, name: string, color: string}>>([])
  const [searchQuery, setSearchQuery] = createSignal('')
  
  
  onMount(async () => {
    console.log('App mounted, starting initialization...')
    
    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+, for settings
      if (e.metaKey && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    try {
      console.log('Step 1: Getting current window...')
      const currentWindow = getCurrentWindow()
      console.log('Got current window:', currentWindow)
      
      // Load preferences
      console.log('Loading preferences...')
      await loadPreferences()
      
      // Check if we need to migrate notes from localStorage
      const { migrateNotesFromLocalStorage, isMigrationComplete } = await import('./utils/migrateFromLocalStorage')
      if (!isMigrationComplete()) {
        console.log('Migrating notes from localStorage...')
        try {
          const migratedCount = await migrateNotesFromLocalStorage()
          console.log(`Migrated ${migratedCount} notes from localStorage`)
        } catch (migrationError) {
          console.error('Migration failed:', migrationError)
        }
      }
      
      // Load notes from database
      console.log('Step 2: Loading notes from database...')
      try {
        await loadNotes()
        console.log('Notes loaded successfully:', notes().length)
      } catch (loadError) {
        console.error('Failed to load notes:', loadError)
        console.error('Error details:', JSON.stringify(loadError, null, 2))
      }

      // Load categories
      try {
        const cats = await categoriesService.getHierarchicalCategories()
        const flatCategories = []
        const flattenCategories = (categories) => {
          categories.forEach(cat => {
            if (cat.id) {
              flatCategories.push({ id: cat.id, name: cat.name, color: cat.color })
            }
            if (cat.subcategories) {
              flattenCategories(cat.subcategories)
            }
          })
        }
        flattenCategories(cats)
        setAvailableCategories(flatCategories)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
      
      // Listen for window events
      console.log('Step 3: Setting up window event listeners...')
      try {
        await currentWindow.listen(TauriEvent.WINDOW_FOCUS, () => {
          console.log('Window focused')
        })
        console.log('Window event listeners set up')
      } catch (eventError) {
        console.error('Failed to set up window events:', eventError)
      }
      
      // Check if window is always on top
      console.log('Step 4: Checking window always on top status...')
      try {
        const alwaysOnTop = await currentWindow.isAlwaysOnTop()
        setIsAlwaysOnTop(alwaysOnTop)
        console.log('Always on top status:', alwaysOnTop)
      } catch (topError) {
        console.error('Failed to check always on top:', topError)
      }
      
      // Update current time every second
      console.log('Step 5: Setting up time interval...')
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      
      console.log('App initialization completed')
      return () => {
        clearInterval(timeInterval)
        document.removeEventListener('keydown', handleKeyDown)
      }
    } catch (err) {
      console.error('CRITICAL: Error during app initialization:', err)
      console.error('Error stack:', err.stack)
    }
  })

  // Remove old auto-save functionality since we're using the database
  
  const createFloatingNote = async () => {
    try {
      const note = await createNote('New Floating Note')
      if (!note) return
      
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

  const createRegularNote = async () => {
    const note = await createNote('New Note')
    if (!note) return
    
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
      setLastSaved(new Date())
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

  const showVersionHistory = () => {
    const note = selectedNote()
    if (!note) return
    
    // Version history will be implemented with backend support
    alert('Version history will be available in a future update.')
  }

  const handleWikiLinkClick = async (noteTitle: string, exists: boolean) => {
    if (exists) {
      // Find and navigate to existing note
      const targetNote = notes().find(note => note.title.toLowerCase() === noteTitle.toLowerCase())
      if (targetNote) {
        setSelectedNote(targetNote)
        setNoteTitle(targetNote.title)
        setNoteContent(targetNote.content)
      }
    } else {
      // Create new note
      const newNote = await createNote(noteTitle)
      if (newNote) {
        setSelectedNote(newNote)
        setNoteTitle(newNote.title)
        setNoteContent(newNote.content)
      }
    }
  }

  const handleContentInput = (e: InputEvent) => {
    const target = e.target as HTMLTextAreaElement
    const value = target.value
    const cursorPos = target.selectionStart || 0
    
    setNoteContent(value)
    
    // Check for wikilink auto-completion
    const wikiLinkInfo = findWikiLinkAtCursor(value, cursorPos)
    
    if (wikiLinkInfo.isInWikiLink && wikiLinkInfo.linkText !== undefined) {
      // Show auto-complete
      const matches = getAutoCompleteMatches(wikiLinkInfo.linkText, notes())
      setAutoCompleteResults(matches)
      
      if (matches.length > 0) {
        // Calculate position for auto-complete dropdown
        const rect = target.getBoundingClientRect()
        setAutoCompletePosition({
          top: rect.top + 20,
          left: rect.left + 10
        })
        setShowAutoComplete(true)
      } else {
        setShowAutoComplete(false)
      }
    } else {
      setShowAutoComplete(false)
    }
  }

  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId) return null
    return availableCategories().find(cat => cat.id.toString() === categoryId)
  }

  const formatNoteDate = (dateString: string | Date) => {
    const noteDate = new Date(dateString)
    const today = new Date()
    
    // Check if the note is from today
    const isToday = noteDate.toDateString() === today.toDateString()
    
    if (isToday) {
      // Format as "19:16" for today's notes
      return noteDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      // Format as "Sun Jun 15" for other dates (macOS style)
      return noteDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const filteredNotesForDisplay = () => {
    const query = searchQuery().toLowerCase()
    if (!query) return notes()
    
    return notes().filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    )
  }

  const insertAutoComplete = (noteTitle: string) => {
    const textarea = document.querySelector('textarea[placeholder*="content"]') as HTMLTextAreaElement
    if (!textarea) return
    
    const value = textarea.value
    const cursorPos = textarea.selectionStart || 0
    const wikiLinkInfo = findWikiLinkAtCursor(value, cursorPos)
    
    if (wikiLinkInfo.isInWikiLink && wikiLinkInfo.startPos !== undefined) {
      const beforeLink = value.slice(0, wikiLinkInfo.startPos)
      const afterCursor = value.slice(cursorPos)
      const newValue = beforeLink + `[[${noteTitle}]]` + afterCursor
      
      setNoteContent(newValue)
      setShowAutoComplete(false)
      
      // Set cursor position after the inserted link
      setTimeout(() => {
        const newCursorPos = beforeLink.length + `[[${noteTitle}]]`.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    }
  }

  const renderContentWithLinks = () => {
    const content = noteContent()
    if (!content.trim()) return content
    
    const parsed = parseWikiLinks(content, notes())
    
    if (parsed.links.length === 0) {
      return content
    }
    
    let result = content
    let offset = 0
    
    // Replace links from end to start to maintain correct indices
    parsed.links.reverse().forEach(link => {
      const displayText = link.displayText || link.noteTitle
      const className = link.exists ? 'wikilink-exists' : 'wikilink-missing'
      
      const beforeLink = result.slice(0, link.startIndex)
      const afterLink = result.slice(link.endIndex)
      
      result = beforeLink + displayText + afterLink
    })
    
    return result
  }

  const togglePreviewMode = () => {
    setShowPreview(!showPreview())
    saveCurrentNote() // Save before switching modes
  }

  
  return (
    <div class="flex flex-col h-screen bg-macos-bg">
      {/* Loading State */}
      <Show when={isLoading()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="text-center">
            <Icon icon="material-symbols:sync" class="w-8 h-8 animate-spin mb-2" />
            <p class="text-macos-text">Loading notes...</p>
          </div>
        </div>
      </Show>
      
      {/* Error State */}
      <Show when={error()}>
        <div class="fixed top-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 z-50">
          <p class="text-red-400">{error()}</p>
        </div>
      </Show>
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
            class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag flex items-center gap-2"
          >
            <Icon icon="material-symbols:dynamic-feed" class="w-4 h-4" />
          </button>
          <button
            onClick={toggleAlwaysOnTop}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
            title={isAlwaysOnTop() ? "Unpin from top" : "Pin to top"}
          >
            <Icon 
              icon={isAlwaysOnTop() ? "material-symbols:push-pin" : "material-symbols:push-pin-outline"} 
              class="w-4 h-4" 
            />
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag flex items-center gap-1"
            title="Export to Obsidian"
          >
            <Icon icon="simple-icons:obsidian" class="w-4 h-4" />
            <span class="text-xs">Export</span>
            <Icon icon="material-symbols:keyboard-arrow-right" class="w-3 h-3 opacity-60" />
          </button>
          <button
            onClick={hideToMenuBar}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
          >
            Hide
          </button>
          <button
            onClick={() => setShowSettings(true)}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag flex items-center gap-1"
            title="Settings"
          >
            <Icon icon="material-symbols:settings" class="w-4 h-4" />
            <Icon icon="material-symbols:keyboard-arrow-right" class="w-3 h-3 opacity-60" />
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
                <div class="flex-1 flex items-center gap-3">
                  <input
                    type="text"
                    value={noteTitle()}
                    onInput={(e) => setNoteTitle(e.target.value)}
                    onBlur={saveCurrentNote}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Move cursor to beginning of content area when Enter is pressed
                        const contentTextarea = document.querySelector('textarea[placeholder*="content"]') as HTMLTextAreaElement
                        if (contentTextarea) {
                          contentTextarea.focus()
                          // Force cursor to absolute beginning, even if there's existing content
                          setTimeout(() => {
                            contentTextarea.setSelectionRange(0, 0)
                            contentTextarea.scrollTop = 0 // Also scroll to top
                          }, 0)
                        }
                      }
                    }}
                    class="flex-1 text-2xl font-semibold bg-transparent border-none outline-none text-macos-text no-drag"
                    placeholder="Note title..."
                    ref={(el) => {
                      // Auto-focus title when note is selected
                      if (el && selectedNote()) {
                        setTimeout(() => el.focus(), 100)
                      }
                    }}
                  />
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    class="p-2 hover-highlight rounded no-drag flex items-center gap-1"
                    title="Manage categories"
                  >
                    <Icon icon="material-symbols:category" class="w-4 h-4" />
                    <Icon icon="material-symbols:keyboard-arrow-right" class="w-3 h-3 opacity-60" />
                  </button>
                  <button
                    onClick={togglePreviewMode}
                    class={`p-2 hover-highlight rounded no-drag flex items-center gap-1 ${showPreview() ? 'bg-blue-500/20 text-blue-400' : ''}`}
                    title={showPreview() ? "Switch to edit mode" : "Preview with clickable links"}
                  >
                    <Icon 
                      icon={showPreview() ? "material-symbols:edit" : "material-symbols:visibility"} 
                      class="w-4 h-4" 
                    />
                    <Icon 
                      icon="material-symbols:keyboard-arrow-right" 
                      class="w-3 h-3 opacity-60" 
                    />
                  </button>
                  <button
                    onClick={showVersionHistory}
                    class="p-2 hover-highlight rounded no-drag"
                    title="View version history"
                  >
                    <Icon icon="material-symbols:history" class="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const note = selectedNote()
                      if (note) togglePinNote(note.id)
                    }}
                    class="p-2 hover-highlight rounded no-drag"
                    title="Pin note"
                  >
                    <Icon 
                      icon={selectedNote()?.isPinned ? "material-symbols:push-pin" : "material-symbols:push-pin-outline"} 
                      class="w-4 h-4" 
                    />
                  </button>
                  <button
                    onClick={() => {
                      const note = selectedNote()
                      if (note) {
                        if (preferences().editor.confirm_delete) {
                          setNoteToDelete(note.id)
                          setShowDeleteConfirm(true)
                        } else {
                          // Delete without confirmation
                          deleteNote(note.id)
                          setSelectedNote(null)
                          setNoteTitle('')
                          setNoteContent('')
                        }
                      }
                    }}
                    class="p-2 hover-highlight rounded text-red-400 no-drag"
                    title="Delete note"
                  >
                    <Icon icon="material-symbols:delete-outline" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Content Editor/Preview */}
              <Show 
                when={!showPreview()}
                fallback={
                  <div class="flex-1 p-4 overflow-y-auto native-scrollbar leading-relaxed">
                    <WikiLinkRenderer 
                      content={noteContent()}
                      noteList={notes()}
                      onLinkClick={handleWikiLinkClick}
                    />
                  </div>
                }
              >
                <textarea
                  value={noteContent()}
                  onInput={handleContentInput}
                  onBlur={saveCurrentNote}
                  onKeyDown={(e) => {
                    // Only native shortcuts - no custom ones
                    if (e.metaKey && e.key === 's') {
                      e.preventDefault()
                      saveCurrentNote()
                    }
                  }}
                  class="flex-1 bg-transparent border-none outline-none text-macos-text resize-none no-drag native-scrollbar leading-relaxed"
                  placeholder="Write your note..."
                  style={{
                    "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    "line-height": "1.6"
                  }}
                />
              </Show>
            </div>
          </Show>
        </div>
      </div>
      
      {/* Auto-complete Dropdown */}
      <Show when={showAutoComplete()}>
        <div 
          class="fixed z-50 bg-black/90 backdrop-blur-md border border-macos-border rounded-lg shadow-2xl max-w-xs"
          style={{
            top: `${autoCompletePosition().top}px`,
            left: `${autoCompletePosition().left}px`
          }}
        >
          <div class="p-2">
            <div class="text-xs text-macos-text-secondary mb-2 px-2 flex items-center gap-1">
              <Icon icon="material-symbols:link" class="w-3 h-3" />
              Link to note:
            </div>
            <For each={autoCompleteResults()}>
              {(note, index) => (
                <div 
                  class="px-3 py-2 hover:bg-macos-hover rounded cursor-pointer text-sm transition-colors"
                  onClick={() => insertAutoComplete(note.title)}
                >
                  <div class="font-medium">{note.title}</div>
                </div>
              )}
            </For>
            <Show when={autoCompleteResults().length === 0}>
              <div class="px-3 py-2 text-sm text-macos-text-secondary italic">
                No existing notes found
              </div>
            </Show>
          </div>
        </div>
      </Show>
      
      {/* Resize Handle */}
      <div 
        class="h-1 bg-macos-border hover:bg-blue-500/50 cursor-ns-resize transition-colors no-drag"
        onMouseDown={handleResizeStart}
        title="Drag to resize editor"
      />
      
      {/* Bottom Notes List - nvALT Style */}
      <div class="flex-1 sidebar-glass border-t border-macos-border">
        <div class="p-4 h-full">
          <div class="mb-3">
            <input
              type="text"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${notes().length} notes...`}
              class="w-full px-3 py-2 text-xs bg-macos-hover border border-macos-border rounded-lg outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div class="space-y-1 max-h-36 overflow-y-auto native-scrollbar">
            <For each={filteredNotesForDisplay()} fallback={
              <p class="text-macos-text-secondary text-sm italic py-4">
                {searchQuery() ? 'No matching notes' : 'No notes yet'}
              </p>
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
                      <div class="text-sm font-semibold truncate flex items-center gap-1">
                        {note.isPinned && (
                          <Icon icon="material-symbols:push-pin" class="w-3 h-3 text-blue-400" />
                        )}
                        {getCategoryInfo(note.categoryId) && (
                          <div 
                            class="w-2 h-2 rounded-full border border-white/20" 
                            style={{ backgroundColor: getCategoryInfo(note.categoryId)!.color }}
                            title={getCategoryInfo(note.categoryId)!.name}
                          />
                        )}
                        {note.title}
                      </div>
                      <div class="text-xs text-macos-text-secondary truncate mt-1 flex items-center gap-2">
                        <span>{note.content.split('\n')[0] || 'Empty note'}</span>
                        {getCategoryInfo(note.categoryId) && (
                          <span class="text-xs px-1.5 py-0.5 rounded" style={{ 
                            backgroundColor: getCategoryInfo(note.categoryId)!.color + '20',
                            color: getCategoryInfo(note.categoryId)!.color 
                          }}>
                            {getCategoryInfo(note.categoryId)!.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-2">
                      <span class="text-xs text-macos-text-secondary">
                        {formatNoteDate(note.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div class="h-6 bg-macos-border/50 backdrop-blur-md flex items-center justify-between px-4 text-xs text-macos-text-secondary border-t border-macos-border">
        <div class="flex items-center space-x-4">
          <span class="flex items-center gap-1">
            <Icon icon="material-symbols:note" class="w-3 h-3" />
            {notes().length} notes
          </span>
          <Show when={selectedNote()}>
            <span class="flex items-center gap-1">
              <Icon icon="material-symbols:edit" class="w-3 h-3" />
              Editing: {selectedNote()?.title}
            </span>
          </Show>
          <Show when={lastSaved()}>
            <span class="flex items-center gap-1">
              <Icon icon="material-symbols:save" class="w-3 h-3" />
              Saved: {lastSaved()?.toLocaleTimeString()}
            </span>
          </Show>
        </div>
        <div class="flex items-center space-x-2">
          <span class="flex items-center gap-1">
            <Icon icon="material-symbols:schedule" class="w-3 h-3" />
            {currentTime().toLocaleTimeString()}
          </span>
          <span class="flex items-center gap-1">
            <Icon icon="material-symbols:calendar-today" class="w-3 h-3" />
            {currentTime().toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Show when={showDeleteConfirm()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-macos-bg border border-macos-border rounded-lg p-6 max-w-sm mx-4">
            <h3 class="text-lg font-semibold mb-4">Delete Note?</h3>
            <p class="text-macos-text-secondary mb-6">
              Are you sure you want to delete "{notes().find(n => n.id === noteToDelete())?.title}"? This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setNoteToDelete(null)
                }}
                class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = noteToDelete()
                  if (id) {
                    deleteNote(id)
                    if (selectedNote()?.id === id) {
                      setSelectedNote(null)
                      setNoteTitle('')
                      setNoteContent('')
                    }
                  }
                  setShowDeleteConfirm(false)
                  setNoteToDelete(null)
                }}
                class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Show>
      
      {/* Settings Modal */}
      <Show when={showSettings()}>
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </Show>
      
      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal()} 
        onClose={() => setShowExportModal(false)} 
      />
      
    </div>
  )
}

export default App