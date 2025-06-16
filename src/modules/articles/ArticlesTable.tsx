import { Component, For, Show } from 'solid-js'
import { Note } from '../../types'
import ArticleRow from './ArticleRow'

interface ArticlesTableProps {
  notes: Note[]
  selectedNote: Note | null
  searchQuery: string
  titleColumnWidth: number
  onRowClick: (note: Note) => void
  onSelectorClick: (noteId: string) => void
  onAssignSelector: (noteId: string, selectorId: number) => void
  onDeleteClick: (note: Note) => void
  onTitleColumnResize: (e: MouseEvent) => void
  getCategoryInfo: (categoryId?: string) => { id: number; name: string; color: string } | null
  formatNoteDate: (date: string | Date) => string
}

const ArticlesTable: Component<ArticlesTableProps> = (props) => {
  return (
    <div class="space-y-1 max-h-36 overflow-y-auto native-scrollbar">
      <For
        each={props.notes}
        fallback={
          <p class="text-macos-text-secondary text-sm italic py-4">
            {props.searchQuery ? "No matching notes" : "No notes yet"}
          </p>
        }
      >
        {(note) => (
          <ArticleRow
            note={note}
            isSelected={props.selectedNote?.id === note.id}
            titleColumnWidth={props.titleColumnWidth}
            onRowClick={props.onRowClick}
            onSelectorClick={props.onSelectorClick}
            onAssignSelector={props.onAssignSelector}
            onDeleteClick={props.onDeleteClick}
            onTitleColumnResize={props.onTitleColumnResize}
            getCategoryInfo={props.getCategoryInfo}
            formatNoteDate={props.formatNoteDate}
          />
        )}
      </For>
    </div>
  )
}

export default ArticlesTable