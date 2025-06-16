import { Component, Show, For, createSignal } from 'solid-js';
import { selectorsStore } from '../../stores/selectorsStore';
import SelectorGrid from '../../components/SelectorGrid';

export const SelectorBar: Component = () => {
  const [isRenamingSelector, setIsRenamingSelector] = createSignal(false);
  const [renameValue, setRenameValue] = createSignal("");

  return (
    <div class="sidebar-glass border-b border-macos-border px-6 py-2">
      <div class="flex flex-col gap-2">
        {/* Selector Name - Centered */}
        <div class="text-center relative">
          <Show when={isRenamingSelector()} fallback={
            <Show when={selectorsStore.activeSelector} fallback={
              <div class="text-lg font-medium text-macos-text-secondary cursor-pointer hover:text-macos-text transition-colors" onClick={() => console.log('Renommer groupe')}>
                Groupe {selectorsStore.currentGroup + 1}/10
              </div>
            }>
              <div 
                class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setRenameValue(selectorsStore.activeSelector?.name || '');
                  setIsRenamingSelector(true);
                }}
              >
                {selectorsStore.activeSelector?.name || selectorsStore.activeSelector?.id}
              </div>
            </Show>
          }>
            {/* Rename Input */}
            <input
              type="text"
              value={renameValue()}
              onInput={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (selectorsStore.activeSelector) {
                    selectorsStore.renameSelector(selectorsStore.activeSelector.id, renameValue());
                  }
                  setIsRenamingSelector(false);
                } else if (e.key === 'Escape') {
                  setIsRenamingSelector(false);
                }
              }}
              onBlur={() => {
                if (selectorsStore.activeSelector) {
                  selectorsStore.renameSelector(selectorsStore.activeSelector.id, renameValue());
                }
                setIsRenamingSelector(false);
              }}
              class="text-2xl font-bold bg-transparent border border-blue-400 rounded px-2 py-1 text-center text-macos-text outline-none"
              placeholder="Nom du sélecteur"
              ref={(el) => setTimeout(() => el?.focus(), 0)}
            />
          </Show>
          
          {/* Group Numbers 1-10 on right */}
          <div class="absolute right-0 top-1/2 transform -translate-y-1/2 flex gap-1">
            <For each={Array.from({length: 10}, (_, i) => i + 1)}>
              {(groupNum) => (
                <button
                  class={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${
                    selectorsStore.currentGroup === groupNum - 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-macos-hover/30 text-macos-text-secondary hover:bg-macos-hover hover:text-macos-text'
                  }`}
                  onClick={() => selectorsStore.navigateToGroup(groupNum - 1)}
                  title={`Groupe ${groupNum}`}
                >
                  {groupNum}
                </button>
              )}
            </For>
          </div>
        </div>
        
        {/* Arrows + Selector Grid on same line */}
        <div class="flex items-center justify-center gap-4" style="align-items: center">
          {/* Left Arrow - Custom SVG LARGE */}
          <Show when={selectorsStore.currentGroup > 0}>
            <button
              class="w-16 h-16 flex items-center justify-center hover:bg-macos-hover/20 rounded-full transition-all duration-200 hover:scale-110"
              onClick={() => selectorsStore.navigateToGroup(selectorsStore.currentGroup - 1)}
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
          
          {/* Selector Grid */}
          <SelectorGrid
            selectors={selectorsStore.getCurrentGroupSelectors()}
            onSelectorClick={(id) => selectorsStore.setActiveSelector(id)}
            currentGroup={selectorsStore.currentGroup}
          />
          
          {/* Right Arrow - Custom SVG LARGE */}
          <Show when={selectorsStore.currentGroup < selectorsStore.totalGroups - 1}>
            <button
              class="w-16 h-16 flex items-center justify-center hover:bg-macos-hover/20 rounded-full transition-all duration-200 hover:scale-110"
              onClick={() => selectorsStore.navigateToGroup(selectorsStore.currentGroup + 1)}
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
      </div>
    </div>
  );
};

export default SelectorBar;