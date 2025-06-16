export interface Selector {
  id: number
  name: string
  isActive: boolean
  color: string
  articleCount: number
  groupIndex: number
}

export interface SelectorGroup {
  groupIndex: number
  selectors: Selector[]
  isActive: boolean
}

export interface SelectorStore {
  selectors: Selector[]
  activeSelector: Selector | null
  currentGroup: number
  totalGroups: number
  setActiveSelector: (id: number) => void
  navigateToGroup: (groupIndex: number) => void
  getCurrentGroupSelectors: () => Selector[]
  getActiveGroupIndex: () => number
  getSelectorsByGroup: (groupIndex: number) => Selector[]
  initializeSelectors: () => void
  renameSelector: (id: number, newName: string) => void
}

export interface BilliardSelectorProps {
  selector: Selector
  onClick: (id: number) => void
  onDoubleClick?: (id: number) => void
  isVisible: boolean
  size?: 'small' | 'medium' | 'large'
  articleCount?: number
}

export interface SelectorGridProps {
  selectors: Selector[]
  onSelectorClick: (id: number) => void
  onSelectorDoubleClick?: (id: number) => void
  currentGroup: number
}

export interface SelectorNavigationProps {
  currentGroup: number
  totalGroups: number
  onNavigate: (direction: 'prev' | 'next') => void
  onNavigateToGroup: (groupIndex: number) => void
  activeSelector: Selector | null
}

export interface KeyboardNavigationHookProps {
  selectors: Selector[]
  currentGroup: number
  onSelectSelector: (id: number) => void
  onNavigateGroup: (direction: 'prev' | 'next') => void
  enabled?: boolean
}

export type SelectorColors = {
  [groupIndex: number]: {
    base: string
    hover: string
    active: string
    variants: string[]
  }
}

export type NavigationDirection = 'prev' | 'next'

export interface SelectorAnimationStates {
  idle: string
  hover: string
  active: string
  pulse: string
  disabled: string
}

export interface SelectorFilterResult {
  selector: Selector
  matchingArticles: any[]
  totalCount: number
}