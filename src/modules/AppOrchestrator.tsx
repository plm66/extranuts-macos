import { Component, createSignal, onMount, Show, createEffect } from 'solid-js'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { TauriEvent } from '@tauri-apps/api/event'
import { invoke } from "@tauri-apps/api/core"
import { Icon } from "@iconify-icon/solid"

// Import stores
import { 
  loadNotes, 
  notes,
  isLoading as notesLoading,
  error as notesError,
  selectedNote,
  setSelectedNote,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  assignSelectorToNote
} from '../stores/noteStore'
import { 
  loadPreferences,
  preferences 
} from '../stores/preferencesStore'
import { selectorsStore } from '../stores/selectorsStore'
import { themeStore } from '../stores/themeStore'
import { categoriesService } from '../services/categories'

// Import modules
import { HeaderLogo, HeaderActions } from './header'
import Editor from './editor'
import { SelectorBar } from './selectors'
import ArticlesTable from './articles'

// Import components
import SettingsPanel from '../components/SettingsPanel'
import ExportModal from '../components/ExportModal'
import CategoryManager from '../components/CategoryManager'

// Import utilities
import { migrateNotesFromLocalStorage, isMigrationComplete } from '../utils/migrateFromLocalStorage'

const AppOrchestrator: Component = () => {
  // Window state
  const [isAlwaysOnTop, setIsAlwaysOnTop] = createSignal(false)
  
  // UI state
  const [editorHeight, setEditorHeight] = createSignal(60) // percentage
  const [currentTime, setCurrentTime] = createSignal(new Date())
  const [lastSaved, setLastSaved] = createSignal<Date | null>(null)
  
  // Modal states
  const [showSettings, setShowSettings] = createSignal(false)
  const [showExportModal, setShowExportModal] = createSignal(false)
  const [showCategoryManager, setShowCategoryManager] = createSignal(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false)
  const [noteToDelete, setNoteToDelete] = createSignal<string | null>(null)
  
  // Categories
  const [availableCategories, setAvailableCategories] = createSignal<
    Array<{ id: number; name: string; color: string }>
  >([])
  
  // Search
  const [searchQuery, setSearchQuery] = createSignal("")

  // Initialize app
  onMount(async () => {
    console.log("AppOrchestrator mounted, starting initialization...")

    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === ",") {
        e.preventDefault()
        setShowSettings(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    try {
      // Get current window
      const currentWindow = getCurrentWindow()
      
      // Load preferences
      await loadPreferences()

      // Check migration
      if (!isMigrationComplete()) {
        console.log("Migrating notes from localStorage...")
        try {
          const migratedCount = await migrateNotesFromLocalStorage()
          console.log(`Migrated ${migratedCount} notes from localStorage`)
        } catch (migrationError) {
          console.error("Migration failed:", migrationError)
        }
      }

      // Load notes
      await loadNotes()
      console.log("Notes loaded successfully:", notes().length)

      // Load categories
      try {
        const cats = await categoriesService.getHierarchicalCategories()
        const flatCategories = []
        const flattenCategories = (categories) => {
          categories.forEach((cat) => {
            if (cat.id) {
              flatCategories.push({
                id: cat.id,
                name: cat.name,
                color: cat.color,
              })
            }
            if (cat.subcategories) {
              flattenCategories(cat.subcategories)
            }
          })
        }
        flattenCategories(cats)
        setAvailableCategories(flatCategories)
      } catch (err) {
        console.error("Failed to load categories:", err)
      }

      // Window events
      await currentWindow.listen(TauriEvent.WINDOW_FOCUS, () => {
        console.log("Window focused")
      })

      // Check always on top
      const alwaysOnTop = await currentWindow.isAlwaysOnTop()
      setIsAlwaysOnTop(alwaysOnTop)

      // Update time
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)

      console.log("AppOrchestrator initialization completed")
      
      return () => {
        clearInterval(timeInterval)
        document.removeEventListener("keydown", handleKeyDown)
      }
    } catch (err) {
      console.error("CRITICAL: Error during app initialization:", err)
    }
  })

  // Window controls
  const toggleAlwaysOnTop = async () => {
    try {
      await invoke("toggle_always_on_top", { window: getCurrentWindow() })
      setIsAlwaysOnTop(!isAlwaysOnTop())
    } catch (error) {
      console.error("Failed to toggle always on top:", error)
    }
  }

  const hideToMenuBar = async () => {
    try {
      await invoke("show_in_menu_bar")
    } catch (error) {
      console.error("Failed to hide to menu bar:", error)
    }
  }

  const createFloatingNote = async () => {
    try {
      const note = await createNote("New Floating Note")
      if (!note) return

      updateNote(note.id, { isFloating: true })

      await invoke("create_floating_window", {
        label: `note-${note.id}`,
        width: 400,
        height: 300,
      })

      setSelectedNote(note)
    } catch (error) {
      console.error("Failed to create floating window:", error)
    }
  }

  const createRegularNote = async () => {
    const note = await createNote("New Note")
    if (!note) return

    setSelectedNote(note)
    // Focus will be handled by the editor
  }

  // Editor resize
  const handleResizeStart = (e: MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = editorHeight()

    const handleResize = (e: MouseEvent) => {
      const deltaY = e.clientY - startY
      const containerHeight = window.innerHeight - 64
      const deltaPercentage = (deltaY / containerHeight) * 100
      const newHeight = Math.max(20, Math.min(80, startHeight + deltaPercentage))
      setEditorHeight(newHeight)
    }

    const handleResizeEnd = () => {
      document.removeEventListener("mousemove", handleResize)
      document.removeEventListener("mouseup", handleResizeEnd)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    document.addEventListener("mousemove", handleResize)
    document.addEventListener("mouseup", handleResizeEnd)
    document.body.style.cursor = "ns-resize"
    document.body.style.userSelect = "none"
  }

  // Track saves
  createEffect(() => {
    const note = selectedNote()
    if (note) {
      setLastSaved(new Date())
    }
  })

  return (
    <div class={`flex flex-col h-screen bg-macos-bg ${themeStore.theme() === "light" ? "theme-light" : ""}`}>
      {/* Loading State */}
      <Show when={notesLoading()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="text-center">
            <Icon icon="material-symbols:sync" class="w-8 h-8 animate-spin mb-2" />
            <p class="text-macos-text">Loading notes...</p>
          </div>
        </div>
      </Show>

      {/* Error State */}
      <Show when={notesError()}>
        <div class="fixed top-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 z-50">
          <p class="text-red-400">{notesError()}</p>
        </div>
      </Show>

      {/* Top Header */}
      <div class="h-16 sidebar-glass flex items-center justify-between px-6 border-b border-macos-border drag-region">
        <HeaderLogo />
        <HeaderActions
          onNewNote={createRegularNote}
          onNewFloatingNote={createFloatingNote}
          isAlwaysOnTop={isAlwaysOnTop()}
          onToggleAlwaysOnTop={toggleAlwaysOnTop}
          onShowExport={() => setShowExportModal(true)}
          onHideToMenuBar={hideToMenuBar}
          onShowSettings={() => setShowSettings(true)}
        />
      </div>

      {/* Selectors Section */}
      <SelectorBar />

      {/* Editor Area */}
      <div class="flex flex-col" style={{ height: `${editorHeight()}%` }}>
        <Editor onShowCategoryManager={() => setShowCategoryManager(true)} />
      </div>

      {/* Resize Handle */}
      <div
        class="h-1 bg-macos-border hover:bg-blue-500/50 cursor-ns-resize transition-colors no-drag"
        onMouseDown={handleResizeStart}
        title="Drag to resize editor"
      />

      {/* Bottom Notes List */}
      <div class="flex-1 sidebar-glass border-t border-macos-border">
        <ArticlesTable
          searchQuery={searchQuery()}
          onSearchChange={setSearchQuery}
          availableCategories={availableCategories()}
          onNoteSelect={(note) => {
            setSelectedNote(note)
          }}
          onNoteDelete={(noteId) => {
            if (preferences().editor.confirm_delete) {
              setNoteToDelete(noteId)
              setShowDeleteConfirm(true)
            } else {
              deleteNote(noteId)
              if (selectedNote()?.id === noteId) {
                setSelectedNote(null)
              }
            }
          }}
        />
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
              Are you sure you want to delete "{notes().find((n) => n.id === noteToDelete())?.title}"? 
              This action cannot be undone.
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

      {/* Modals */}
      <Show when={showSettings()}>
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </Show>

      <ExportModal
        isOpen={showExportModal()}
        onClose={() => setShowExportModal(false)}
      />

      <Show when={showCategoryManager()}>
        <CategoryManager onClose={() => setShowCategoryManager(false)} />
      </Show>
    </div>
  )
}

export default AppOrchestrator