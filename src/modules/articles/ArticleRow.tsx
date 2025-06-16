import { Component } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { Note } from '../../types'
import NoteSelectorColumn from '../../components/NoteSelectorColumn'

interface ArticleRowProps {
  note: Note
  isSelected: boolean
  titleColumnWidth: number
  onRowClick: (note: Note) => void
  onSelectorClick: (noteId: string) => void
  onAssignSelector: (noteId: string, selectorId: number) => void
  onDeleteClick: (note: Note) => void
  onTitleColumnResize: (e: MouseEvent) => void
  getCategoryInfo: (categoryId?: string) => { id: number; name: string; color: string } | null
  formatNoteDate: (date: string | Date) => string
}

const ArticleRow: Component<ArticleRowProps> = (props) => {
  return (
    <div
      class={`w-full p-2 rounded cursor-pointer transition-colors no-drag text-left border-b border-macos-border ${
        props.isSelected
          ? "bg-macos-hover border border-macos-border"
          : "hover-highlight"
      }`}
      onClick={() => props.onRowClick(props.note)}
    >
      <div class="flex items-center">
        {/* Selector Column */}
        <div class="w-12 flex-shrink-0 flex justify-center items-center">
          <NoteSelectorColumn
            selectorId={props.note.selectorId}
            noteId={props.note.id}
            onClick={props.onSelectorClick}
            onAssign={props.onAssignSelector}
          />
        </div>

        {/* Title Column with resize */}
        <div
          class="flex items-center"
          style={{ width: `${props.titleColumnWidth}px` }}
        >
          <div class="flex-1 min-w-0 px-1">
            <div class="text-sm font-semibold truncate flex items-center gap-1">
              {props.note.isPinned && (
                <Icon
                  icon="material-symbols:push-pin"
                  class="w-3 h-3 text-blue-400"
                />
              )}
              {props.getCategoryInfo(props.note.categoryId) && (
                <div
                  class="w-2 h-2 rounded-full border border-white/20"
                  style={{
                    backgroundColor: props.getCategoryInfo(
                      props.note.categoryId
                    )!.color,
                  }}
                  title={props.getCategoryInfo(props.note.categoryId)!.name}
                />
              )}
              <span title={props.note.title}>{props.note.title}</span>
            </div>
          </div>
          {/* Resize handle */}
          <div
            class="w-1 h-full cursor-col-resize bg-blue-500/50 transition-colors"
            onMouseDown={props.onTitleColumnResize}
          />
        </div>

        {/* Content Preview Column */}
        <div class="flex-1 min-w-0 px-1.5">
          <div class="text-xs text-macos-text-secondary truncate flex items-center gap-2">
            <span>
              {props.note.content.split("\n")[0] || "Empty note"}
            </span>
            {props.getCategoryInfo(props.note.categoryId) && (
              <span
                class="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor:
                    props.getCategoryInfo(props.note.categoryId)!.color + "20",
                  color: props.getCategoryInfo(props.note.categoryId)!.color,
                }}
              >
                {props.getCategoryInfo(props.note.categoryId)!.name}
              </span>
            )}
          </div>
        </div>

        {/* Delete Column */}
        <div class="flex-shrink-0 px-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              props.onDeleteClick(props.note)
            }}
            class="p-2 hover-highlight rounded text-red-400 no-drag"
            title="Delete note"
          >
            <Icon
              icon="material-symbols:delete-outline"
              class="w-4 h-4"
            />
          </button>
        </div>

        {/* Timestamp Column */}
        <div class="flex-shrink-0 px-2">
          <span class="text-xs text-macos-text-secondary">
            {props.formatNoteDate(props.note.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ArticleRow