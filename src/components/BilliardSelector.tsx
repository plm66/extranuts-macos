import { Component, createMemo } from 'solid-js'
import { BilliardSelectorProps, Selector, SelectorAnimationStates } from '../types/selectors'

const billiardColors = {
  0: { base: '#ff6b6b', hover: '#ff5252', active: '#ff4444', variants: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c'] }, // Rouge clair → foncé
  1: { base: '#4fc3f7', hover: '#42a5f5', active: '#2196f3', variants: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'] }, // Bleu clair → foncé  
  2: { base: '#ba68c8', hover: '#ab47bc', active: '#9c27b0', variants: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c'] }, // Violet clair → foncé
  3: { base: '#ffb74d', hover: '#ffa726', active: '#ff9800', variants: ['#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100'] }, // Orange clair → foncé
  4: { base: '#29b6f6', hover: '#039be5', active: '#0288d1', variants: ['#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4', '#039be5', '#0288d1', '#0277bd', '#01579b'] }, // Cyan clair → foncé
  5: { base: '#f06292', hover: '#ec407a', active: '#e91e63', variants: ['#fce4ec', '#f8bbd9', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b', '#ad1457', '#880e4f'] }, // Rose clair → foncé
  6: { base: '#9575cd', hover: '#7e57c2', active: '#673ab7', variants: ['#ede7f6', '#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2', '#673ab7', '#5e35b1', '#512da8', '#4527a0', '#311b92'] }, // Indigo clair → foncé
  7: { base: '#26c6da', hover: '#00bcd4', active: '#00acc1', variants: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#006064'] }, // Cyan clair → foncé
  8: { base: '#ffee58', hover: '#ffeb3b', active: '#fdd835', variants: ['#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b', '#fdd835', '#fbc02d', '#f9a825', '#f57f17'] }, // Jaune clair → foncé  
  9: { base: '#ff8a65', hover: '#ff7043', active: '#ff5722', variants: ['#fbe9e7', '#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#ff5722', '#f4511e', '#e64a19', '#d84315', '#bf360c'] } // Orange-rouge clair → foncé
}

const animationStates: SelectorAnimationStates = {
  idle: 'transform transition-all duration-150 ease-out',
  hover: 'transform scale-110 transition-all duration-150 ease-out shadow-lg',
  active: 'transform scale-105 transition-all duration-150 ease-out animate-pulse',
  pulse: 'animate-pulse',
  disabled: 'opacity-50 cursor-not-allowed'
}

const BilliardSelector: Component<BilliardSelectorProps> = (props) => {
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
    
    console.log(`Sélecteur ${props.selector.id}: groupe=${group}, position=${positionInGroup}, couleur=${groupColors.variants[positionInGroup]}`)
    
    return {
      base: groupColors.variants[positionInGroup] || groupColors.base,
      hover: groupColors.hover,
      active: groupColors.active
    }
  })

  const baseStyle = createMemo(() => ({
    'background': `radial-gradient(circle at 30% 30%, ${colorScheme().base}ff, ${colorScheme().base}aa 50%, ${colorScheme().base}66 100%)`,
    'box-shadow': `
      0 4px 8px rgba(0,0,0,0.3),
      inset 0 1px 0 rgba(255,255,255,0.5),
      inset 0 -1px 0 rgba(0,0,0,0.3),
      0 0 15px ${colorScheme().base}40
    `
  }))

  const hoverStyle = createMemo(() => ({
    'background': `radial-gradient(circle at 30% 30%, ${colorScheme().hover}ff, ${colorScheme().hover}bb 50%, ${colorScheme().hover}77 100%)`,
    'box-shadow': `
      0 6px 12px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.6),
      inset 0 -1px 0 rgba(0,0,0,0.4),
      0 0 25px ${colorScheme().hover}60
    `
  }))

  const activeStyle = createMemo(() => ({
    'background': `radial-gradient(circle at 30% 30%, ${colorScheme().active}ff, ${colorScheme().active}cc 50%, ${colorScheme().active}88 100%)`,
    'box-shadow': `
      0 2px 4px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.7),
      inset 0 -1px 0 rgba(0,0,0,0.5),
      0 0 30px ${colorScheme().active}80
    `
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
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseStyle())}
      onClick={() => props.onClick(props.selector.id)}
    >
      {/* Reflet brillant sur la boule */}
      <div class="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full blur-sm"></div>
      
      <div class="flex items-center justify-center relative z-10">
        <span class="font-black text-lg drop-shadow-sm">{props.selector.id}</span>
      </div>
    </div>
  )
}

export default BilliardSelector