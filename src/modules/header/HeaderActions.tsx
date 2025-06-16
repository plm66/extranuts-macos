import { Component } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import ThemeToggle from "../../components/ThemeToggle";

interface HeaderActionsProps {
  onNewNote: () => void;
  onNewFloatingNote: () => void;
  isAlwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
  onShowExport: () => void;
  onHideToMenuBar: () => void;
  onShowSettings: () => void;
}

/**
 * HeaderActions - Header action buttons
 * Includes: New Note, Floating Note, Pin, Export, Theme, Hide, Settings
 */
export const HeaderActions: Component<HeaderActionsProps> = (props) => {
  return (
    <div class="flex items-center space-x-2">
      <button
        onClick={props.onNewNote}
        class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
      >
        + New Note
      </button>
      <button
        onClick={props.onNewFloatingNote}
        class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag flex items-center gap-2"
      >
        <Icon icon="material-symbols:dynamic-feed" class="w-4 h-4" />
      </button>
      <button
        onClick={props.onToggleAlwaysOnTop}
        class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
        title={props.isAlwaysOnTop ? "Unpin from top" : "Pin to top"}
      >
        <Icon
          icon={
            props.isAlwaysOnTop
              ? "material-symbols:push-pin"
              : "material-symbols:push-pin-outline"
          }
          class="w-4 h-4"
        />
      </button>
      <button
        onClick={props.onShowExport}
        class="px-3 py-1.5 text-sm hover-highlight rounded no-drag flex items-center gap-1"
        title="Export to Obsidian"
      >
        <Icon icon="simple-icons:obsidian" class="w-4 h-4" />
        <span class="text-xs">Export</span>
        <Icon
          icon="material-symbols:keyboard-arrow-right"
          class="w-3 h-3 opacity-60"
        />
      </button>
      <ThemeToggle />
      <button
        onClick={props.onHideToMenuBar}
        class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
      >
        Hide
      </button>
      <button
        onClick={props.onShowSettings}
        class="px-3 py-1.5 text-sm hover-highlight rounded no-drag flex items-center gap-1"
        title="Settings"
      >
        <Icon icon="material-symbols:settings" class="w-4 h-4" />
        <Icon
          icon="material-symbols:keyboard-arrow-right"
          class="w-3 h-3 opacity-60"
        />
      </button>
    </div>
  );
};

export default HeaderActions;