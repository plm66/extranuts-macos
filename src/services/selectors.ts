import { invoke } from "@tauri-apps/api/core";

export interface Selector {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSelectorRequest {
  id: number;
  name: string;
}

/**
 * Met à jour le nom d'un sélecteur dans la base de données
 */
export async function updateSelectorName(selectorId: number, newName: string): Promise<void> {
  try {
    console.log(`🔄 Updating selector ${selectorId} name to: "${newName}"`)
    await invoke('update_selector_name', {
      request: {
        id: selectorId,
        name: newName
      }
    })
    console.log(`✅ Selector ${selectorId} name updated successfully`)
  } catch (error) {
    console.error('❌ Failed to update selector name:', error)
    throw error
  }
}

/**
 * Récupère un sélecteur par son ID
 */
export async function getSelector(id: number): Promise<Selector | null> {
  try {
    const selector = await invoke<Selector | null>('get_selector', { id })
    return selector
  } catch (error) {
    console.error('❌ Failed to get selector:', error)
    throw error
  }
}

/**
 * Récupère tous les sélecteurs depuis la base de données
 */
export async function getAllSelectors(): Promise<Selector[]> {
  try {
    console.log('📥 Loading all selectors from backend')
    const selectors = await invoke<Selector[]>('get_all_selectors')
    console.log(`✅ Loaded ${selectors.length} selectors from backend`)
    return selectors
  } catch (error) {
    console.error('❌ Failed to load selectors:', error)
    return []
  }
}

/**
 * Charge les noms de sélecteurs personnalisés depuis le backend
 * Retourne un Map pour faciliter la recherche par ID
 */
export async function loadSelectorsMap(): Promise<Map<number, string>> {
  try {
    const selectors = await getAllSelectors()
    const selectorsMap = new Map<number, string>()
    
    selectors.forEach(selector => {
      selectorsMap.set(selector.id, selector.name)
    })
    
    console.log(`📥 Loaded ${selectorsMap.size} custom selector names`)
    return selectorsMap
  } catch (error) {
    console.error('❌ Failed to load selectors map:', error)
    // En cas d'erreur, retourner une Map vide pour permettre le fonctionnement sans backend
    return new Map()
  }
}