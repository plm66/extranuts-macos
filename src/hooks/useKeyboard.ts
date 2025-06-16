import { onMount, onCleanup, createSignal } from 'solid-js'
import type { KeyboardNavigationHookProps } from '../types/selectors'

export const useKeyboard = (props: KeyboardNavigationHookProps) => {
  const [lastKeyTime, setLastKeyTime] = createSignal(0)
  const debounceDelay = 150

  const getCurrentGroupSelectors = () => {
    return props.selectors.filter(selector => selector.groupIndex === props.currentGroup)
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (!props.enabled) return
    
    const now = Date.now()
    if (now - lastKeyTime() < debounceDelay) return
    setLastKeyTime(now)

    const currentSelectors = getCurrentGroupSelectors()

    switch (event.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        event.preventDefault()
        const index = parseInt(event.key) - 1
        if (currentSelectors[index]) {
          props.onSelectSelector(currentSelectors[index].id)
        }
        break

      case '0':
        event.preventDefault()
        if (currentSelectors[9]) {
          props.onSelectSelector(currentSelectors[9].id)
        }
        break

      case 'ArrowLeft':
        event.preventDefault()
        props.onNavigateGroup('prev')
        break

      case 'ArrowRight':
        event.preventDefault()
        props.onNavigateGroup('next')
        break

      case 'Escape':
        event.preventDefault()
        const activeSelector = props.selectors.find(s => s.isActive)
        if (activeSelector) {
          props.onSelectSelector(activeSelector.id)
        }
        break

      case 'Enter':
        event.preventDefault()
        const selectedSelector = props.selectors.find(s => s.isActive)
        if (selectedSelector) {
          console.log('Selector validated:', selectedSelector.name)
        }
        break

      default:
        break
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!props.enabled) return

    if (event.metaKey || event.ctrlKey) {
      const currentSelectors = getCurrentGroupSelectors()
      
      switch (event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          event.preventDefault()
          const index = parseInt(event.key) - 1
          if (currentSelectors[index]) {
            props.onSelectSelector(currentSelectors[index].id)
          }
          break

        case '0':
          event.preventDefault()
          if (currentSelectors[9]) {
            props.onSelectSelector(currentSelectors[9].id)
          }
          break
      }
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress)
      window.addEventListener('keydown', handleKeyDown)
    }
  })

  onCleanup(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  return {
    getCurrentGroupSelectors,
    lastKeyTime: lastKeyTime()
  }
}