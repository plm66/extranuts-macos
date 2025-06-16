import { Component, createSignal, Show } from 'solid-js';
import type { Selector } from '../../types/selectors';

interface SelectorTitleProps {
  activeSelector?: Selector;
  onRename: (id: number, name: string) => void;
}

const SelectorTitle: Component<SelectorTitleProps> = (props) => {
  const [isRenaming, setIsRenaming] = createSignal(false);
  const [renameValue, setRenameValue] = createSignal('');

  const handleStartRename = () => {
    setRenameValue(props.activeSelector?.name || '');
    setIsRenaming(true);
  };

  const handleSaveRename = () => {
    if (props.activeSelector && renameValue()) {
      props.onRename(props.activeSelector.id, renameValue());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
    }
  };

  return (
    <div class="flex justify-center">
      <Show when={!isRenaming()} fallback={
        <input
          type="text"
          value={renameValue()}
          onInput={(e) => setRenameValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveRename}
          class="text-2xl font-bold bg-transparent border border-blue-400 rounded px-2 py-1 text-center text-macos-text outline-none"
          placeholder="Nom du sélecteur"
          ref={(el) => setTimeout(() => el?.focus(), 0)}
        />
      }>
        <div
          class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleStartRename}
        >
          {props.activeSelector?.name || props.activeSelector?.id || 'Sélecteur'}
        </div>
      </Show>
    </div>
  );
};

export default SelectorTitle;