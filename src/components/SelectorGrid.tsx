import { Component, For, createMemo } from 'solid-js'
import { SelectorGridProps, Selector } from '../types/selectors'
import BilliardSelector from './BilliardSelector'
import { articleCountsBySelector } from '../stores/selectorsStore'

const SelectorGrid: Component<SelectorGridProps> = (props) => {
  const visibleSelectors = createMemo(() => 
    props.selectors.filter(selector => selector.groupIndex === props.currentGroup)
  )

  const gridLayout = createMemo(() => {
    const count = visibleSelectors().length
    if (count <= 5) return 'grid-cols-5'
    if (count <= 10) return 'grid-cols-10'
    return 'grid-cols-10'
  })

  const containerClasses = createMemo(() => `
    grid
    ${gridLayout()}
    gap-4
    justify-items-center
    items-center
    transition-all
    duration-300
    ease-in-out
    w-full
    max-w-6xl
    mx-auto
    min-h-20
    py-2
  `)

  return (
    <div class="w-full overflow-hidden">
      <div class={containerClasses()}>
        <For each={visibleSelectors()}>
          {(selector, index) => (
            <div
              class="transition-all duration-300 ease-out"
              style={{
                'animation-delay': `${index() * 50}ms`,
                'animation-fill-mode': 'both'
              }}
            >
              <BilliardSelector
                selector={selector}
                onClick={props.onSelectorClick}
                isVisible={true}
                size="medium"
                articleCount={(() => {
                  const count = articleCountsBySelector().get(selector.id) || 0
                  console.log(`🔸 SelectorGrid - Passage du count pour sélecteur ${selector.id}:`, count)
                  return count
                })()}
              />
            </div>
          )}
        </For>
      </div>
      
      {visibleSelectors().length === 0 && (
        <div class="flex items-center justify-center h-32 text-macos-text-secondary">
          <div class="text-center">
            <div class="text-sm opacity-60">Aucun sélecteur dans ce groupe</div>
            <div class="text-xs opacity-40 mt-1">Groupe {props.currentGroup + 1}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SelectorGrid