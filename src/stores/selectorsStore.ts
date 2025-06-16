import { createSignal, createMemo } from 'solid-js'
import type { Selector, SelectorGroup, SelectorStore, SelectorFilterResult } from '../types/selectors'
import { notes } from './noteStore'

const SELECTOR_NAMES = [
  'Trading', 'Extranut', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', ''
]

const GROUP_COLORS = [
  { base: '#ff4444', hover: '#ff6666', active: '#ff2222' }, // Rouge
  { base: '#4444ff', hover: '#6666ff', active: '#2222ff' }, // Bleu  
  { base: '#44ff44', hover: '#66ff66', active: '#22ff22' }, // Vert
  { base: '#ffaa44', hover: '#ffbb66', active: '#ff9922' }, // Orange
  { base: '#aa44ff', hover: '#bb66ff', active: '#9922ff' }, // Violet
  { base: '#44ffaa', hover: '#66ffbb', active: '#22ff99' }, // Cyan
  { base: '#ff44aa', hover: '#ff66bb', active: '#ff2299' }, // Rose
  { base: '#aaff44', hover: '#bbff66', active: '#99ff22' }, // Lime
  { base: '#4444aa', hover: '#6666bb', active: '#222299' }, // Bleu foncé
  { base: '#aa4444', hover: '#bb6666', active: '#992222' }  // Rouge foncé
]

function generateVariants(baseColor: string, count: number = 10): string[] {
  // Génère des variantes d'une couleur de base
  const variants = []
  for (let i = 0; i < count; i++) {
    const factor = 0.8 + (i * 0.04) // De 0.8 à 1.16
    variants.push(adjustColorBrightness(baseColor, factor))
  }
  return variants
}

function adjustColorBrightness(hex: string, factor: number): string {
  // Ajuste la luminosité d'une couleur hex
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.floor((num >> 16) * factor))
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * factor))
  const b = Math.min(255, Math.floor((num & 0x0000FF) * factor))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function initializeSelectors(): Selector[] {
  console.log('🎯 initializeSelectors - Création des 100 sélecteurs')
  const selectors: Selector[] = []
  
  for (let i = 1; i <= 100; i++) {
    const groupIndex = Math.floor((i - 1) / 10)
    const colorGroup = GROUP_COLORS[groupIndex]
    const variants = generateVariants(colorGroup.base, 10)
    const variantIndex = (i - 1) % 10
    
    selectors.push({
      id: i,
      name: SELECTOR_NAMES[i - 1] || '',
      isActive: false,
      color: variants[variantIndex],
      articleCount: 0, // Will be calculated dynamically
      groupIndex: groupIndex
    })
  }
  
  console.log('🎯 initializeSelectors - Sélecteurs créés:', selectors.length)
  return selectors
}

const [selectors, setSelectors] = createSignal<Selector[]>(initializeSelectors())
const [activeSelector, setActiveSelector] = createSignal<Selector | null>(null)
const [currentGroup, setCurrentGroup] = createSignal<number>(0)

const totalGroups = createMemo(() => Math.ceil(selectors().length / 10))

// Computed memo pour compter les articles par sélecteur
const articleCountsBySelector = createMemo(() => {
  console.log('📊 articleCountsBySelector - DÉBUT du recalcul des comptages')
  console.log('📊 Notes totales:', notes().length)
  console.log('📊 Notes avec selectorId:', notes().filter(n => n.selectorId).map(n => ({ id: n.id, title: n.title, selectorId: n.selectorId })))
  
  const counts = new Map<number, number>()
  
  // Initialiser tous les sélecteurs à 0
  selectors().forEach(selector => {
    counts.set(selector.id, 0)
  })
  
  // Compter les notes assignées à chaque sélecteur
  notes().forEach(note => {
    if (note.selectorId) {
      console.log(`📊 Note "${note.title}" assignée au sélecteur ${note.selectorId}`)
      const currentCount = counts.get(note.selectorId) || 0
      counts.set(note.selectorId, currentCount + 1)
    }
  })
  
  console.log('📊 articleCountsBySelector - FIN du recalcul')
  console.log('📊 Résultat complet:', Array.from(counts.entries()))
  console.log('📊 Sélecteurs avec comptage > 0:', Array.from(counts.entries()).filter(([_, count]) => count > 0))
  return counts
})

const getCurrentGroupSelectors = () => {
  const start = currentGroup() * 10
  const end = start + 10
  const groupSelectors = selectors().slice(start, end)
  console.log(`🎯 getCurrentGroupSelectors - Groupe: ${currentGroup()}, Sélecteurs: ${groupSelectors.map(s => s.id).join(', ')}`)
  return groupSelectors
}

const getActiveGroupIndex = () => {
  const active = activeSelector()
  return active ? Math.floor((active.id - 1) / 10) : currentGroup()
}

const getSelectorsByGroup = (groupIndex: number) => {
  const start = groupIndex * 10
  const end = start + 10
  return selectors().slice(start, end)
}

const setActiveSelectorFn = (id: number) => {
  console.log('🎯 setActiveSelectorFn appelé avec ID:', id)
  
  setSelectors(prev => prev.map(s => ({ ...s, isActive: s.id === id })))
  
  const selector = selectors().find(s => s.id === id)
  setActiveSelector(selector || null)
  console.log('🎯 Nouveau sélecteur actif:', selector)
  
  if (selector) {
    const newGroup = Math.floor((selector.id - 1) / 10)
    setCurrentGroup(newGroup)
    
    // TODO: Déclencher le filtrage des articles
    filterArticlesBySelector(selector)
  }
}

const renameSelectorFn = (id: number, newName: string) => {
  setSelectors(prev => prev.map(s => 
    s.id === id ? { ...s, name: newName.trim() } : s
  ))
  
  // Mettre à jour activeSelector si c'est celui qui est renommé
  const updatedSelector = selectors().find(s => s.id === id)
  if (activeSelector()?.id === id && updatedSelector) {
    setActiveSelector(updatedSelector)
  }
}

const navigateToGroup = (groupIndex: number) => {
  const maxGroup = totalGroups() - 1
  const validGroup = Math.max(0, Math.min(maxGroup, groupIndex))
  setCurrentGroup(validGroup)
}

const filterArticlesBySelector = (selector: Selector): SelectorFilterResult => {
  console.log('🔍 filterArticlesBySelector - Filtrage pour le sélecteur:', selector.id, selector.name)
  
  // Import dynamique pour éviter les dépendances circulaires
  import('../stores/noteStore').then(({ notes, setSearchQuery }) => {
    // Filtrer les notes basées sur le nom du sélecteur
    const selectorName = selector.name.toLowerCase()
    const matchingNotes = notes().filter(note => 
      note.title.toLowerCase().includes(selectorName) ||
      note.content.toLowerCase().includes(selectorName) ||
      note.tags.some(tag => tag.toLowerCase().includes(selectorName)) ||
      note.category?.name?.toLowerCase().includes(selectorName)
    )
    
    // Mettre à jour la recherche pour afficher les résultats
    setSearchQuery(selector.name)
    
    console.log(`🔍 Sélecteur "${selector.name}" - ${matchingNotes.length} notes trouvées`)
    return matchingNotes
  }).catch(err => {
    console.error('❌ Erreur lors du filtrage:', err)
  })
  
  return {
    selector,
    matchingArticles: [], // Sera rempli par le filtrage asynchrone
    totalCount: selector.articleCount
  }
}

const initializeSelectorsFn = () => {
  setSelectors(initializeSelectors())
  setActiveSelector(null)
  setCurrentGroup(0)
}

export const selectorsStore: SelectorStore = {
  get selectors() { return selectors() },
  get activeSelector() { return activeSelector() },
  get currentGroup() { return currentGroup() },
  get totalGroups() { return totalGroups() },
  setActiveSelector: setActiveSelectorFn,
  navigateToGroup,
  getCurrentGroupSelectors,
  getActiveGroupIndex,
  getSelectorsByGroup,
  initializeSelectors: initializeSelectorsFn,
  renameSelector: renameSelectorFn
}

// Export the article counts memo
export { articleCountsBySelector }

// Export les signaux pour debug (temporaire)
export { activeSelector, setActiveSelector, selectors, setSelectors }

// Helper function to get article count for a specific selector
export const getArticleCountForSelector = (selectorId: number): number => {
  const count = articleCountsBySelector().get(selectorId) || 0
  console.log(`📊 getArticleCountForSelector - ID: ${selectorId}, Count: ${count}`)
  return count
}

// Export des couleurs pour les composants
export const SELECTOR_COLORS = GROUP_COLORS.reduce((acc, colors, index) => {
  acc[index] = {
    ...colors,
    variants: generateVariants(colors.base, 10)
  }
  return acc
}, {} as Record<number, { base: string; hover: string; active: string; variants: string[] }>)