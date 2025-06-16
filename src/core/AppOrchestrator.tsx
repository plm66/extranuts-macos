import { Component, createSignal, onMount } from 'solid-js'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { TauriEvent } from '@tauri-apps/api/event'

// Stores centralisés
import { 
  loadNotes, 
  notes,
  isLoading as notesLoading,
  error as notesError 
} from '../stores/noteStore'
import { 
  loadPreferences,
  preferences 
} from '../stores/preferencesStore'
import { 
  selectorsStore,
  articleCountsBySelector 
} from '../stores/selectorsStore'
import { themeStore } from '../stores/themeStore'

// Types d'orchestration
export interface AppState {
  isInitialized: boolean
  hasErrors: boolean
  initializationProgress: number
}

export interface OrchestratorConfig {
  enableDebugMode: boolean
  enableMigration: boolean
  autoLoadData: boolean
}

// Configuration par défaut
const DEFAULT_CONFIG: OrchestratorConfig = {
  enableDebugMode: import.meta.env.DEV,
  enableMigration: true,
  autoLoadData: true
}

/**
 * AppOrchestrator - Orchestrateur central de l'application
 * 
 * Responsabilités :
 * - Initialisation coordonnée des stores
 * - Gestion centralisée des erreurs
 * - Coordination des modules
 * - États globaux de l'application
 */
const AppOrchestrator: Component<{
  config?: Partial<OrchestratorConfig>
  children: any
}> = (props) => {
  
  // Configuration fusionnée
  const config = () => ({ ...DEFAULT_CONFIG, ...props.config })
  
  // État d'orchestration
  const [appState, setAppState] = createSignal<AppState>({
    isInitialized: false,
    hasErrors: false,
    initializationProgress: 0
  })
  
  // Initialisation orchestrée
  onMount(async () => {
    if (config().enableDebugMode) {
      console.log('🎭 AppOrchestrator - Début initialisation')
    }
    
    try {
      // Phase 1: Window setup (10%)
      await initializeWindow()
      updateProgress(10)
      
      // Phase 2: Preferences (30%)
      await loadPreferences()
      updateProgress(30)
      
      // Phase 3: Migration si nécessaire (50%)
      if (config().enableMigration) {
        await handleMigration()
      }
      updateProgress(50)
      
      // Phase 4: Données principales (80%)
      if (config().autoLoadData) {
        await loadNotes()
      }
      updateProgress(80)
      
      // Phase 5: Finalisation (100%)
      await finalizeInitialization()
      updateProgress(100)
      
      setAppState(prev => ({ ...prev, isInitialized: true }))
      
      if (config().enableDebugMode) {
        console.log('🎭 AppOrchestrator - Initialisation terminée')
        logAppStatus()
      }
      
    } catch (error) {
      console.error('🎭 AppOrchestrator - Erreur initialisation:', error)
      setAppState(prev => ({ ...prev, hasErrors: true }))
    }
  })
  
  // Helpers d'initialisation
  const updateProgress = (progress: number) => {
    setAppState(prev => ({ ...prev, initializationProgress: progress }))
  }
  
  const initializeWindow = async () => {
    const currentWindow = getCurrentWindow()
    await currentWindow.listen(TauriEvent.WINDOW_FOCUS, () => {
      console.log('🎭 Window focused')
    })
  }
  
  const handleMigration = async () => {
    // Migration logic sera implémentée ici
    console.log('🎭 Migration check...')
  }
  
  const finalizeInitialization = async () => {
    // Synchronisation finale des stores
    console.log('🎭 Finalizing stores synchronization...')
  }
  
  // Debug helper
  const logAppStatus = () => {
    console.log('📊 App Status:', {
      notes: notes().length,
      theme: themeStore.theme(),
      preferences: !!preferences(),
      activeSelector: selectorsStore.activeSelector,
      articleCounts: articleCountsBySelector().size
    })
  }
  
  return props.children
}

export default AppOrchestrator