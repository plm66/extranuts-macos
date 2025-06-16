// Fichier de debug pour tester les sélecteurs dans la console
import { selectorsStore, activeSelector, setActiveSelector, selectors, articleCountsBySelector } from './stores/selectorsStore'

// Exposer les fonctions au window pour pouvoir les tester dans la console
declare global {
  interface Window {
    debugSelectors: {
      store: typeof selectorsStore
      activeSelector: typeof activeSelector
      setActiveSelector: typeof setActiveSelector
      selectors: typeof selectors
      articleCountsBySelector: typeof articleCountsBySelector
      testClick: (id: number) => void
      showState: () => void
    }
  }
}

window.debugSelectors = {
  store: selectorsStore,
  activeSelector,
  setActiveSelector,
  selectors,
  articleCountsBySelector,
  
  testClick: (id: number) => {
    console.log('=== TEST CLICK SELECTOR ===')
    console.log('ID cliqué:', id)
    console.log('État avant:', {
      active: activeSelector()?.id,
      group: selectorsStore.currentGroup
    })
    
    selectorsStore.setActiveSelector(id)
    
    console.log('État après:', {
      active: activeSelector()?.id,
      group: selectorsStore.currentGroup
    })
    console.log('========================')
  },
  
  showState: () => {
    console.log('=== ÉTAT DES SÉLECTEURS ===')
    console.log('Total sélecteurs:', selectors().length)
    console.log('Groupe actuel:', selectorsStore.currentGroup)
    console.log('Sélecteur actif:', activeSelector())
    console.log('Sélecteurs du groupe actuel:', selectorsStore.getCurrentGroupSelectors())
    console.log('Comptages articles:', Array.from(articleCountsBySelector().entries()).filter(([_, count]) => count > 0))
    console.log('==========================')
  }
}

console.log('🐛 Debug des sélecteurs activé! Utilisez window.debugSelectors dans la console.')
console.log('Commandes disponibles:')
console.log('- window.debugSelectors.testClick(1) // Simule un click sur le sélecteur 1')
console.log('- window.debugSelectors.showState() // Affiche l\'état complet')
console.log('- window.debugSelectors.store.setActiveSelector(1) // Active directement le sélecteur 1')