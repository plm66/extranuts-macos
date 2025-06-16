import { Component, createMemo, createSignal, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'

interface NoteSelectorColumnProps {
  selectorId?: number
  onClick: (noteId: string) => void
  noteId: string
  onAssign: (noteId: string, selectorId: number) => void
}

const billiardColors = {
  0: { base: '#d4a5a5', hover: '#c99999', active: '#be8d8d', variants: ['#f5f0f0', '#ede0e0', '#e5d0d0', '#dcc0c0', '#d4a5a5', '#cb9a9a', '#c28f8f', '#b98484', '#b07979', '#a76e6e'] },
  1: { base: '#a5c4d4', hover: '#99b8c9', active: '#8dacbe', variants: ['#f0f4f5', '#e0e9ed', '#d0dee5', '#c0d3dc', '#a5c4d4', '#9ab9cb', '#8faec2', '#84a3b9', '#7998b0', '#6e8da7'] },
  2: { base: '#c4a5d4', hover: '#b899c9', active: '#ac8dbe', variants: ['#f4f0f5', '#e9e0ed', '#ded0e5', '#d3c0dc', '#c4a5d4', '#b99acb', '#ae8fc2', '#a384b9', '#9879b0', '#8d6ea7'] },
  3: { base: '#d4a5a5', hover: '#c99999', active: '#be8d8d', variants: ['#f5f0f0', '#ede0e0', '#e5d0d0', '#dcc0c0', '#d4a5a5', '#cb9a9a', '#c28f8f', '#b98484', '#b07979', '#a76e6e'] },
  4: { base: '#a5a5d4', hover: '#9999c9', active: '#8d8dbe', variants: ['#f0f0f5', '#e0e0ed', '#d0d0e5', '#c0c0dc', '#a5a5d4', '#9a9acb', '#8f8fc2', '#8484b9', '#7979b0', '#6e6ea7'] },
  5: { base: '#d4a5c4', hover: '#c999b8', active: '#be8dac', variants: ['#f5f0f4', '#ede0e9', '#e5d0de', '#dcc0d3', '#d4a5c4', '#cb9ab9', '#c28fae', '#b984a3', '#b07998', '#a76e8d'] },
  6: { base: '#b4a5d4', hover: '#a999c9', active: '#9e8dbe', variants: ['#f2f0f5', '#e6e0ed', '#dad0e5', '#cec0dc', '#b4a5d4', '#a99acb', '#9e8fc2', '#9384b9', '#8879b0', '#7d6ea7'] },
  7: { base: '#a5b4d4', hover: '#99a9c9', active: '#8d9ebe', variants: ['#f0f2f5', '#e0e6ed', '#d0dae5', '#c0cedc', '#a5b4d4', '#9aa9cb', '#8f9ec2', '#8493b9', '#7988b0', '#6e7da7'] },
  8: { base: '#d4d4a5', hover: '#c9c999', active: '#bebe8d', variants: ['#f5f5f0', '#edede0', '#e5e5d0', '#dcdcc0', '#d4d4a5', '#cbcb9a', '#c2c28f', '#b9b984', '#b0b079', '#a7a76e'] },
  9: { base: '#d4a5d4', hover: '#c999c9', active: '#be8dbe', variants: ['#f5f0f5', '#ede0ed', '#e5d0e5', '#dcc0dc', '#d4a5d4', '#cb9acb', '#c28fc2', '#b984b9', '#b079b0', '#a76ea7'] }
}

const NoteSelectorColumn: Component<NoteSelectorColumnProps> = (props) => {
  const [isAssigning, setIsAssigning] = createSignal(false)
  const [inputValue, setInputValue] = createSignal("")
  
  const isAssigned = () => props.selectorId !== undefined

  const selectorNumber = createMemo(() => {
    if (!isAssigned() || !props.selectorId) return null
    return ((props.selectorId - 1) % 10) + 1
  })

  const colorScheme = createMemo(() => {
    if (!isAssigned() || !props.selectorId) return null
    
    const group = Math.floor((props.selectorId - 1) / 10)
    const positionInGroup = (props.selectorId - 1) % 10
    const groupColors = billiardColors[group as keyof typeof billiardColors] || billiardColors[0]
    
    return {
      base: groupColors.variants[positionInGroup] || groupColors.base,
      hover: groupColors.hover,
      active: groupColors.active
    }
  })

  const handleClick = () => {
    setInputValue("")
    setIsAssigning(true)
  }

  const handleAssign = () => {
    const num = parseInt(inputValue())
    if (num >= 1 && num <= 100) {
      props.onAssign(props.noteId, num)
    }
    setIsAssigning(false)
    setInputValue("")
  }

  const handleCancel = () => {
    setIsAssigning(false)
    setInputValue("")
  }

  return (
    <div class="relative">
      <Show when={!isAssigning()} fallback={
        <input
          type="number"
          min="1"
          max="100"
          placeholder="1-100"
          value={inputValue()}
          onInput={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAssign()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              handleCancel()
            }
          }}
          onBlur={handleCancel}
          class="w-8 h-8 text-xs text-center bg-blue-500/20 border border-blue-400 rounded-full outline-none text-white font-bold"
          ref={(el) => setTimeout(() => el?.focus(), 0)}
        />
      }>
        <button
          class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
          style={{
            'background-color': isAssigned() 
              ? colorScheme()?.base || '#d4a5a5'
              : '#6B7280',
            'box-shadow': isAssigned() 
              ? `0 2px 4px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)`
              : '0 1px 2px rgba(0,0,0,0.2)',
            'border': isAssigned() 
              ? '1px solid rgba(255,255,255,0.2)'
              : '1px dashed rgba(255,255,255,0.3)'
          }}
          onClick={handleClick}
          title={isAssigned() 
            ? `Sélecteur ${props.selectorId} assigné - Cliquer pour changer` 
            : 'Cliquer pour assigner un sélecteur (1-100)'
          }
        >
          {isAssigned() ? (
            <span class="text-xs font-bold text-white drop-shadow-sm">
              {selectorNumber()}
            </span>
          ) : (
            <Icon 
              icon="mdi:plus" 
              class="w-4 h-4 text-macos-text-secondary opacity-60" 
            />
          )}
        </button>
      </Show>
    </div>
  )
}

export default NoteSelectorColumn