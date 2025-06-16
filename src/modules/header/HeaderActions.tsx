import { Component } from "solid-js";
import { Icon } from "@iconify-icon/solid";

interface HeaderActionsProps {
  onNewNote: () => void;
  onFloat: () => void;
  onPin: () => void;
  onThemeToggle: () => void;
  isPinned?: boolean;
  theme?: "light" | "dark";
}

/**
 * HeaderActions - Boutons d'actions du header
 * New Note, Float, Pin, Theme toggle
 */
export const HeaderActions: Component<HeaderActionsProps> = (props) => {
  return (
    <div class="flex items-center gap-2">
      <button
        onClick={props.onNewNote}
        class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
      >
        + New Note
      </button>
      <button
        onClick={props.onFloat}
        class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag flex items-center gap-2"
        title="Create floating window"
      >
        <Icon icon="material-symbols:dynamic-feed" class="w-4 h-4" />
      </button>
      <button
        onClick={props.onPin}
        class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
        title={props.isPinned ? "Unpin from top" : "Pin to top"}
      >
        <Icon
          icon={props.isPinned ? "material-symbols:push-pin" : "material-symbols:push-pin-outline"}
          class="w-4 h-4"
        />
      </button>
    </div>
  );
};

export default HeaderActions;