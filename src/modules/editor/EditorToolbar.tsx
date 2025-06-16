import { Component } from 'solid-js'
import { Icon } from '@iconify-icon/solid'

interface EditorToolbarProps {
  isPinned?: boolean
  isPreviewMode: boolean
  onTogglePin: () => void
  onTogglePreview: () => void
  onShowVersionHistory: () => void
  onShowCategoryManager: () => void
  onDelete: () => void
}

const EditorToolbar: Component<EditorToolbarProps> = (props) => {
  return (
    <div class="flex items-center space-x-2">
      <button
        onClick={props.onShowCategoryManager}
        class="p-2 hover-highlight rounded no-drag flex items-center gap-1"
        title="Manage categories"
      >
        <Icon icon="material-symbols:category" class="w-4 h-4" />
        <Icon
          icon="material-symbols:keyboard-arrow-right"
          class="w-3 h-3 opacity-60"
        />
      </button>
      <button
        onClick={props.onTogglePreview}
        class={`p-2 hover-highlight rounded no-drag flex items-center gap-1 ${props.isPreviewMode ? "bg-blue-500/20 text-blue-400" : ""}`}
        title={
          props.isPreviewMode
            ? "Switch to edit mode"
            : "Preview with clickable links"
        }
      >
        <Icon
          icon={
            props.isPreviewMode
              ? "material-symbols:edit"
              : "material-symbols:visibility"
          }
          class="w-4 h-4"
        />
        <Icon
          icon="material-symbols:keyboard-arrow-right"
          class="w-3 h-3 opacity-60"
        />
      </button>
      <button
        onClick={props.onShowVersionHistory}
        class="p-2 hover-highlight rounded no-drag"
        title="View version history"
      >
        <Icon icon="material-symbols:history" class="w-4 h-4" />
      </button>
      <button
        onClick={props.onTogglePin}
        class="p-2 hover-highlight rounded no-drag"
        title="Pin note"
      >
        <Icon
          icon={
            props.isPinned
              ? "material-symbols:push-pin"
              : "material-symbols:push-pin-outline"
          }
          class="w-4 h-4"
        />
      </button>
      <button
        onClick={props.onDelete}
        class="p-2 hover-highlight rounded text-red-400 no-drag"
        title="Delete note"
      >
        <Icon
          icon="material-symbols:delete-outline"
          class="w-4 h-4"
        />
      </button>
    </div>
  )
}

export default EditorToolbar