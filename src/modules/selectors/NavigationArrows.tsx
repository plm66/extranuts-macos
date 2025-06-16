import { Component, Show, JSX } from 'solid-js';

interface NavigationArrowsProps {
  currentGroup: number;
  totalGroups: number;
  onNavigate: (group: number) => void;
  children?: JSX.Element;
}

const NavigationArrows: Component<NavigationArrowsProps> = (props) => {
  return (
    <div class="flex items-center justify-center gap-4" style="align-items: center">
      {/* Flèche gauche */}
      <Show when={props.currentGroup > 0}>
        <button
          class="w-16 h-16 flex items-center justify-center hover:bg-macos-hover/20 rounded-full transition-all duration-200 hover:scale-110"
          onClick={() => props.onNavigate(props.currentGroup - 1)}
          title="Groupe précédent"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="text-macos-text">
            <path 
              d="M30 36L18 24L30 12" 
              stroke="currentColor" 
              stroke-width="4" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </Show>
      
      {/* Contenu central (SelectorGrid) */}
      {props.children}
      
      {/* Flèche droite */}
      <Show when={props.currentGroup < props.totalGroups - 1}>
        <button
          class="w-16 h-16 flex items-center justify-center hover:bg-macos-hover/20 rounded-full transition-all duration-200 hover:scale-110"
          onClick={() => props.onNavigate(props.currentGroup + 1)}
          title="Groupe suivant"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="text-macos-text">
            <path 
              d="M18 12L30 24L18 36" 
              stroke="currentColor" 
              stroke-width="4" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </Show>
    </div>
  );
};

export default NavigationArrows;