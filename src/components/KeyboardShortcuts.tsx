import { Component } from 'solid-js'
import { Icon } from '@iconify-icon/solid'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

const KeyboardShortcuts: Component<KeyboardShortcutsProps> = (props) => {
  if (!props.isOpen) return null
  
  const shortcuts = [
    { keys: ['⌘', 'B'], description: 'Bold text' },
    { keys: ['⌘', 'I'], description: 'Italic text' },
    { keys: ['⌘', 'K'], description: 'Insert link' },
    { keys: ['⌘', 'S'], description: 'Save note' },
    { keys: ['⌘', ','], description: 'Open settings' },
    { keys: ['[['], description: 'Create WikiLink' },
    { keys: ['Tab'], description: 'Indent list item' },
  ]
  
  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-macos-bg border border-macos-border rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Keyboard Shortcuts</h3>
          <button
            onClick={props.onClose}
            class="p-1 hover-highlight rounded"
          >
            <Icon icon="material-symbols:close" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-2">
          {shortcuts.map(shortcut => (
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center gap-1">
                {shortcut.keys.map((key, index) => (
                  <>
                    <kbd class="px-2 py-1 bg-black/30 border border-macos-border rounded text-xs font-mono">
                      {key}
                    </kbd>
                    {index < shortcut.keys.length - 1 && (
                      <span class="text-macos-text-secondary mx-1">+</span>
                    )}
                  </>
                ))}
              </div>
              <span class="text-sm text-macos-text-secondary">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
        
        <div class="mt-4 pt-4 border-t border-macos-border">
          <p class="text-xs text-macos-text-secondary">
            Tip: Use markdown syntax for rich formatting (**, *, #, -, etc.)
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcuts