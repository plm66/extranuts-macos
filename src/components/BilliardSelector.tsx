import { Component, createMemo, Show } from 'solid-js'
import { BilliardSelectorProps, Selector, SelectorAnimationStates } from '../types/selectors'

const billiardColors = {
  0: { base: '#d4a5a5', hover: '#c99999', active: '#be8d8d', variants: ['#f5f0f0', '#ede0e0', '#e5d0d0', '#dcc0c0', '#d4a5a5', '#cb9a9a', '#c28f8f', '#b98484', '#b07979', '#a76e6e'] }, // Rouge doux
  1: { base: '#a5c4d4', hover: '#99b8c9', active: '#8dacbe', variants: ['#f0f4f5', '#e0e9ed', '#d0dee5', '#c0d3dc', '#a5c4d4', '#9ab9cb', '#8faec2', '#84a3b9', '#7998b0', '#6e8da7'] }, // Bleu doux
  2: { base: '#c4a5d4', hover: '#b899c9', active: '#ac8dbe', variants: ['#f4f0f5', '#e9e0ed', '#ded0e5', '#d3c0dc', '#c4a5d4', '#b99acb', '#ae8fc2', '#a384b9', '#9879b0', '#8d6ea7'] }, // Violet doux
  3: { base: '#d4a5a5', hover: '#c99999', active: '#be8d8d', variants: ['#f5f0f0', '#ede0e0', '#e5d0d0', '#dcc0c0', '#d4a5a5', '#cb9a9a', '#c28f8f', '#b98484', '#b07979', '#a76e6e'] }, // Orange doux
  4: { base: '#a5a5d4', hover: '#9999c9', active: '#8d8dbe', variants: ['#f0f0f5', '#e0e0ed', '#d0d0e5', '#c0c0dc', '#a5a5d4', '#9a9acb', '#8f8fc2', '#8484b9', '#7979b0', '#6e6ea7'] }, // Indigo doux
  5: { base: '#d4a5c4', hover: '#c999b8', active: '#be8dac', variants: ['#f5f0f4', '#ede0e9', '#e5d0de', '#dcc0d3', '#d4a5c4', '#cb9ab9', '#c28fae', '#b984a3', '#b07998', '#a76e8d'] }, // Rose doux
  6: { base: '#b4a5d4', hover: '#a999c9', active: '#9e8dbe', variants: ['#f2f0f5', '#e6e0ed', '#dad0e5', '#cec0dc', '#b4a5d4', '#a99acb', '#9e8fc2', '#9384b9', '#8879b0', '#7d6ea7'] }, // Lavande doux
  7: { base: '#a5b4d4', hover: '#99a9c9', active: '#8d9ebe', variants: ['#f0f2f5', '#e0e6ed', '#d0dae5', '#c0cedc', '#a5b4d4', '#9aa9cb', '#8f9ec2', '#8493b9', '#7988b0', '#6e7da7'] }, // Bleu-gris doux
  8: { base: '#d4d4a5', hover: '#c9c999', active: '#bebe8d', variants: ['#f5f5f0', '#edede0', '#e5e5d0', '#dcdcc0', '#d4d4a5', '#cbcb9a', '#c2c28f', '#b9b984', '#b0b079', '#a7a76e'] }, // Jaune doux
  9: { base: '#d4a5d4', hover: '#c999c9', active: '#be8dbe', variants: ['#f5f0f5', '#ede0ed', '#e5d0e5', '#dcc0dc', '#d4a5d4', '#cb9acb', '#c28fc2', '#b984b9', '#b079b0', '#a76ea7'] } // Magenta doux
}

const animationStates: SelectorAnimationStates = {
  idle: 'transform transition-all duration-150 ease-out',
  hover: 'transform scale-110 transition-all duration-150 ease-out shadow-lg',
  active: 'transform scale-105 transition-all duration-150 ease-out animate-pulse',
  pulse: 'animate-pulse',
  disabled: 'opacity-50 cursor-not-allowed'
}

const BilliardSelector: Component<BilliardSelectorProps> = (props) => {
  console.log(`🎱 BilliardSelector ${props.selector.id} - articleCount reçu:`, props.articleCount)
  
  const sizeClasses = createMemo(() => {
    switch (props.size || 'medium') {
      case 'small': return 'w-12 h-12 text-xs'
      case 'large': return 'w-20 h-20 text-lg'
      default: return 'w-16 h-16 text-sm'
    }
  })

  const colorScheme = createMemo(() => {
    const group = Math.floor((props.selector.id - 1) / 10)  // Calcul direct du groupe
    const positionInGroup = (props.selector.id - 1) % 10    // Position 0-9 dans le groupe
    const groupColors = billiardColors[group as keyof typeof billiardColors] || billiardColors[0]
    
    
    return {
      base: groupColors.variants[positionInGroup] || groupColors.base,
      hover: groupColors.hover,
      active: groupColors.active
    }
  })

  const baseStyle = createMemo(() => ({
    'background-color': colorScheme().base,
    'box-shadow': `0 2px 4px rgba(0,0,0,0.2)`
  }))

  const hoverStyle = createMemo(() => ({
    'background-color': colorScheme().hover,
    'box-shadow': `0 4px 8px rgba(0,0,0,0.3)`
  }))

  const activeStyle = createMemo(() => ({
    'background-color': colorScheme().active,
    'box-shadow': `0 1px 2px rgba(0,0,0,0.3)`
  }))

  return (
    <div
      class={`
        ${sizeClasses()}
        ${props.isVisible ? 'opacity-100' : 'opacity-0'}
        ${props.selector.isActive ? animationStates.active : animationStates.idle}
        rounded-full
        flex items-center justify-center
        cursor-pointer
        relative
        backdrop-blur-sm
        border border-white/20
        font-bold
        text-white
        select-none
        hover:scale-105 hover:rotate-1
        active:scale-98 active:rotate-0
        transition-all duration-150 ease-out
      `}
      style={props.selector.isActive ? activeStyle() : baseStyle()}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle())}
      onMouseLeave={(e) => {
        if (!props.selector.isActive) {
          Object.assign(e.currentTarget.style, baseStyle())
        }
      }}
      onClick={() => {
        console.log(`🎱 BilliardSelector - Click sur sélecteur ID: ${props.selector.id}`)
        props.onClick(props.selector.id)
      }}
      onDblClick={() => {
        console.log(`🎱 BilliardSelector - Double-click sur sélecteur ID: ${props.selector.id}`)
        props.onDoubleClick?.(props.selector.id)
      }}
    >
      {/* Reflet brillant sur la boule */}
      <div class="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full blur-sm"></div>
      
      <div class="flex items-center justify-center relative z-10">
        <span class="font-black text-lg drop-shadow-sm">{props.selector.id}</span>
      </div>
      
      {/* Badge compteur rouge - specs Alice */}
      <Show when={(() => {
        const shouldShow = props.articleCount && props.articleCount > 0
        console.log(`🎱 Badge sélecteur ${props.selector.id} - shouldShow:`, shouldShow, 'count:', props.articleCount)
        return shouldShow
      })()}>
        <div 
          class="absolute rounded-full flex items-center justify-center font-bold shadow-sm border border-white/30"
          style={{
            top: '-8px',
            right: '-8px',
            width: '16px',
            height: '16px',
            'background-color': '#ff6b6b',
            color: 'white',
            'font-size': '10px'
          }}
        >
          {props.articleCount}
        </div>
      </Show>
    </div>
  )
}

export default BilliardSelector