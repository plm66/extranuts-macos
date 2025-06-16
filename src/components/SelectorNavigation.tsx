import { Component, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import type { SelectorNavigationProps, NavigationDirection } from '../types/selectors'

const SelectorNavigation: Component<SelectorNavigationProps> = (props) => {
  const canNavigatePrev = () => props.currentGroup > 0
  const canNavigateNext = () => props.currentGroup < props.totalGroups - 1

  const handleNavigation = (direction: NavigationDirection) => {
    if (direction === 'prev' && canNavigatePrev()) {
      props.onNavigate('prev')
    } else if (direction === 'next' && canNavigateNext()) {
      props.onNavigate('next')
    }
  }

  const handleGroupClick = (groupIndex: number) => {
    if (groupIndex !== props.currentGroup) {
      props.onNavigateToGroup(groupIndex)
    }
  }

  const renderGroupIndicators = () => {
    const indicators = []
    for (let i = 0; i < props.totalGroups; i++) {
      indicators.push(
        <button
          class={`w-2 h-2 rounded-full transition-all duration-300 transform relative ${
            i === props.currentGroup 
              ? 'bg-macos-text scale-125 shadow-lg' 
              : 'bg-macos-text-secondary hover:bg-macos-text hover:scale-110 hover:shadow-md'
          }`}
          onClick={() => handleGroupClick(i)}
          title={`Groupe ${i + 1} - Clic pour y aller`}
        >
          {i === props.currentGroup && (
            <div class="absolute inset-0 rounded-full bg-macos-text animate-pulse opacity-30" />
          )}
        </button>
      )
    }
    return indicators
  }

  return (
    <div class="flex items-center justify-center px-4 py-3">
      {/* Flèche gauche - grosse et visible */}
      <Show when={canNavigatePrev()}>
        <button
          class="p-4 hover:bg-macos-hover rounded-lg transition-all duration-200 hover:scale-110"
          onClick={() => handleNavigation('prev')}
          title="Groupe précédent"
        >
          <Icon icon="mdi:chevron-left" class="w-8 h-8 text-macos-text" />
        </button>
      </Show>
      
      {/* Nom du sélecteur en grand au centre */}
      <div class="flex-1 text-center">
        <Show when={props.activeSelector} fallback={
          <div class="text-lg font-medium text-macos-text-secondary">
            Groupe {props.currentGroup + 1}/10
          </div>
        }>
          <div class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
            {props.activeSelector?.name}
          </div>
        </Show>
      </div>
      
      {/* Flèche droite - grosse et visible */}
      <Show when={canNavigateNext()}>
        <button
          class="p-4 hover:bg-macos-hover rounded-lg transition-all duration-200 hover:scale-110"
          onClick={() => handleNavigation('next')}
          title="Groupe suivant"
        >
          <Icon icon="mdi:chevron-right" class="w-8 h-8 text-macos-text" />
        </button>
      </Show>
    </div>
  )
}

export default SelectorNavigation