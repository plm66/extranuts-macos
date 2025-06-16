import { onMount } from 'solid-js'
import { loadSelectorsMap } from '../services/selectors'
import { setSelectors, selectors } from '../stores/selectorsStore'

/**
 * Hook pour charger les noms de sélecteurs personnalisés depuis le backend au démarrage
 */
export function useLoadSelectors() {
  onMount(async () => {
    console.log('🔄 Loading selectors from backend...')
    
    try {
      const selectorsMap = await loadSelectorsMap()
      
      if (selectorsMap.size > 0) {
        // Mettre à jour les sélecteurs avec les noms personnalisés
        setSelectors(prev => prev.map(selector => {
          const customName = selectorsMap.get(selector.id)
          if (customName !== undefined) {
            return { ...selector, name: customName }
          }
          return selector
        }))
        
        console.log(`✅ Loaded ${selectorsMap.size} custom selector names`)
      } else {
        console.log('📝 No custom selector names in database')
      }
    } catch (error) {
      console.error('❌ Failed to load selectors:', error)
      // L'application continue de fonctionner avec les noms par défaut
    }
  })
}