import { Component, createSignal, onMount } from 'solid-js'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { TauriEvent } from '@tauri-apps/api/event'

const App: Component = () => {
  const [notes, setNotes] = createSignal<any[]>([])
  const [selectedNote, setSelectedNote] = createSignal<any>(null)
  const [isAlwaysOnTop, setIsAlwaysOnTop] = createSignal(false)
  
  onMount(async () => {
    const currentWindow = getCurrentWindow()
    
    // Listen for window events
    await currentWindow.listen(TauriEvent.WINDOW_FOCUS, () => {
      console.log('Window focused')
    })
    
    // Check if window is always on top
    const alwaysOnTop = await currentWindow.isAlwaysOnTop()
    setIsAlwaysOnTop(alwaysOnTop)
  })
  
  const createFloatingNote = async () => {
    try {
      await invoke('create_floating_window', {
        label: `note-${Date.now()}`,
        width: 400,
        height: 300
      })
    } catch (error) {
      console.error('Failed to create floating window:', error)
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
          <button
            onClick={createFloatingNote}
            class="w-full mb-4 px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
          >
            New Floating Note
          </button>
          
          <div class="space-y-2">
            <p class="text-macos-text-secondary text-xs uppercase tracking-wider mb-2">
              Recent Notes
            </p>
            {/* Note list will go here */}
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
        <div class="flex-1 p-8">
          <div class="glass-morphism p-6 h-full">
            <h2 class="text-2xl mb-4">Welcome to Extranuts</h2>
            <p class="text-macos-text-secondary">
              Your native macOS note-taking app with floating windows and menu bar support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App