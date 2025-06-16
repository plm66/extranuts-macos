import { Component, createSignal, For } from 'solid-js'
import SelectorNavigation from './SelectorNavigation'
import { useKeyboard } from '../hooks/useKeyboard'
import type { Selector } from '../types/selectors'

const SelectorDemo: Component = () => {
  const [selectors, setSelectors] = createSignal<Selector[]>([])
  const [activeSelector, setActiveSelector] = createSignal<Selector | null>(null)
  const [currentGroup, setCurrentGroup] = createSignal(0)
  const totalGroups = 10

  const initializeSelectors = () => {
    const mockSelectors: Selector[] = []
    for (let group = 0; group < totalGroups; group++) {
      for (let i = 0; i < 10; i++) {
        mockSelectors.push({
          id: group * 10 + i,
          name: `Sélecteur ${group + 1}-${i + 1}`,
          isActive: false,
          color: `hsl(${(group * 36) % 360}, 70%, 60%)`,
          articleCount: Math.floor(Math.random() * 50),
          groupIndex: group
        })
      }
    }
    setSelectors(mockSelectors)
  }

  const handleSelectSelector = (id: number) => {
    setSelectors(prev => prev.map(s => ({ ...s, isActive: s.id === id })))
    const selected = selectors().find(s => s.id === id)
    setActiveSelector(selected || null)
  }

  const handleNavigateGroup = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentGroup() > 0) {
      setCurrentGroup(prev => prev - 1)
    } else if (direction === 'next' && currentGroup() < totalGroups - 1) {
      setCurrentGroup(prev => prev + 1)
    }
  }

  const handleNavigateToGroup = (groupIndex: number) => {
    setCurrentGroup(groupIndex)
  }

  useKeyboard({
    selectors: selectors(),
    currentGroup: currentGroup(),
    onSelectSelector: handleSelectSelector,
    onNavigateGroup: handleNavigateGroup,
    enabled: true
  })

  const getCurrentGroupSelectors = () => {
    return selectors().filter(s => s.groupIndex === currentGroup())
  }

  onMount(() => {
    initializeSelectors()
  })

  return (
    <div class="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div class="text-center mb-6">
        <h2 class="text-lg font-semibold text-macos-text mb-2">
          Demo Navigation Sélecteurs
        </h2>
        <p class="text-sm text-macos-text-secondary">
          Touches 1-9,0 : sélection rapide | ← → : navigation groupes | Échap : désélection
        </p>
      </div>

      <SelectorNavigation
        currentGroup={currentGroup()}
        totalGroups={totalGroups}
        onNavigate={handleNavigateGroup}
        onNavigateToGroup={handleNavigateToGroup}
        activeSelector={activeSelector()}
      />

      <div class="grid grid-cols-5 gap-3 p-4 glass-morphism">
        <For each={getCurrentGroupSelectors()}>
          {(selector, index) => (
            <button
              class={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                selector.isActive
                  ? 'border-macos-text bg-macos-hover shadow-lg'
                  : 'border-macos-border hover:border-macos-text-secondary hover:bg-macos-hover/50'
              }`}
              onClick={() => handleSelectSelector(selector.id)}
              title={`${selector.name} (${selector.articleCount} articles) - Touche ${(index() + 1) % 10}`}
            >
              <div class="flex flex-col items-center space-y-2">
                <div
                  class="w-8 h-8 rounded-full shadow-md"
                  style={`background-color: ${selector.color}`}
                />
                <div class="text-xs text-center">
                  <div class="font-medium text-macos-text truncate">
                    {selector.name}
                  </div>
                  <div class="text-macos-text-secondary">
                    {selector.articleCount}
                  </div>
                </div>
              </div>
            </button>
          )}
        </For>
      </div>

      <div class="text-xs text-macos-text-secondary text-center">
        Groupe actuel: {currentGroup() + 1}/{totalGroups} | 
        Sélecteurs: {getCurrentGroupSelectors().length}/10
      </div>
    </div>
  )
}

export default SelectorDemo