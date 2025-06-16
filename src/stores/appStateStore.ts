import { createSignal, createMemo } from 'solid-js'

// Interface pour l'état global UI
export interface AppUIState {
  // Modals et overlays
  showExportModal: boolean
  showCategoryManager: boolean
  showSettings: boolean
  
  // Layout et dimensions
  editorHeight: number // percentage
  titleColumnWidth: number // pixels
  
  // Sélecteurs état
  isRenamingSelector: boolean
  renameValue: string
  
  // Recherche UI (différent des données)
  searchQuery: string
  
  // Navigation et fenêtre
  isAlwaysOnTop: boolean
  
  // Timestamps et état
  lastSaved: Date | null
  currentTime: Date
}

// État initial
const initialState: AppUIState = {
  // Modals
  showExportModal: false,
  showCategoryManager: false,
  showSettings: false,
  
  // Layout
  editorHeight: 60,
  titleColumnWidth: 200,
  
  // Sélecteurs
  isRenamingSelector: false,
  renameValue: '',
  
  // Recherche
  searchQuery: '',
  
  // Fenêtre
  isAlwaysOnTop: false,
  
  // État temporal
  lastSaved: null,
  currentTime: new Date()
}

// Store centralisé
const [appState, setAppState] = createSignal<AppUIState>(initialState)

// Actions pour les modals
export const modalActions = {
  showExport: () => setAppState(prev => ({ ...prev, showExportModal: true })),
  hideExport: () => setAppState(prev => ({ ...prev, showExportModal: false })),
  
  showCategories: () => setAppState(prev => ({ ...prev, showCategoryManager: true })),
  hideCategories: () => setAppState(prev => ({ ...prev, showCategoryManager: false })),
  
  showSettings: () => setAppState(prev => ({ ...prev, showSettings: true })),
  hideSettings: () => setAppState(prev => ({ ...prev, showSettings: false })),
  
  closeAllModals: () => setAppState(prev => ({
    ...prev,
    showExportModal: false,
    showCategoryManager: false,
    showSettings: false
  }))
}

// Actions pour le layout
export const layoutActions = {
  setEditorHeight: (height: number) => 
    setAppState(prev => ({ ...prev, editorHeight: Math.max(20, Math.min(80, height)) })),
  
  setTitleColumnWidth: (width: number) => 
    setAppState(prev => ({ ...prev, titleColumnWidth: Math.max(100, Math.min(400, width)) })),
  
  toggleAlwaysOnTop: () => 
    setAppState(prev => ({ ...prev, isAlwaysOnTop: !prev.isAlwaysOnTop }))
}

// Actions pour les sélecteurs
export const selectorActions = {
  startRenaming: (currentName: string = '') => setAppState(prev => ({
    ...prev,
    isRenamingSelector: true,
    renameValue: currentName
  })),
  
  stopRenaming: () => setAppState(prev => ({
    ...prev,
    isRenamingSelector: false,
    renameValue: ''
  })),
  
  updateRenameValue: (value: string) => 
    setAppState(prev => ({ ...prev, renameValue: value }))
}

// Actions pour la recherche
export const searchActions = {
  setQuery: (query: string) => setAppState(prev => ({ ...prev, searchQuery: query })),
  clearQuery: () => setAppState(prev => ({ ...prev, searchQuery: '' }))
}

// Actions temporelles
export const timeActions = {
  updateCurrentTime: () => setAppState(prev => ({ ...prev, currentTime: new Date() })),
  setLastSaved: (date: Date | null = new Date()) => 
    setAppState(prev => ({ ...prev, lastSaved: date }))
}

// Sélecteurs mémorisés pour performance
export const appSelectors = {
  // Modal states
  modalsOpen: createMemo(() => {
    const state = appState()
    return state.showExportModal || state.showCategoryManager || state.showSettings
  }),
  
  // Layout state
  layoutDimensions: createMemo(() => ({
    editorHeight: appState().editorHeight,
    titleColumnWidth: appState().titleColumnWidth
  })),
  
  // Search state
  hasSearchQuery: createMemo(() => appState().searchQuery.trim().length > 0),
  
  // Time state
  timeSinceLastSave: createMemo(() => {
    const lastSaved = appState().lastSaved
    if (!lastSaved) return null
    return Math.floor((appState().currentTime.getTime() - lastSaved.getTime()) / 1000)
  })
}

// Hook principal pour utiliser le store
export const useAppState = () => {
  return {
    // État
    state: appState,
    
    // Actions groupées
    modals: modalActions,
    layout: layoutActions,
    selectors: selectorActions,
    search: searchActions,
    time: timeActions,
    
    // Sélecteurs
    computed: appSelectors
  }
}

// Export des parties spécifiques pour compatibilité
export { appState }
export default useAppState