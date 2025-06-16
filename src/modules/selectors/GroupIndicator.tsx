import { Component, For } from 'solid-js';

interface GroupIndicatorProps {
  currentGroup: number;
  totalGroups: number;
  onNavigateToGroup: (group: number) => void;
}

const GroupIndicator: Component<GroupIndicatorProps> = (props) => {
  return (
    <div class="absolute right-0 top-1/2 transform -translate-y-1/2 flex gap-1">
      <For each={Array.from({length: Math.min(10, props.totalGroups)}, (_, i) => i)}>
        {(groupIndex) => (
          <button
            class={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${
              props.currentGroup === groupIndex
                ? 'bg-blue-500 text-white'
                : 'bg-macos-hover/30 text-macos-text-secondary hover:bg-macos-hover hover:text-macos-text'
            }`}
            onClick={() => props.onNavigateToGroup(groupIndex)}
            title={`Groupe ${groupIndex + 1}`}
          >
            {groupIndex + 1}
          </button>
        )}
      </For>
    </div>
  );
};

export default GroupIndicator;