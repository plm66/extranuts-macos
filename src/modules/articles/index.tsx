import { Component } from 'solid-js'
import { Note } from '../../types'
import SearchBar from './SearchBar'
import ArticlesTable from './ArticlesTable'
import { useArticles } from './useArticles'

interface ArticlesModuleProps {
  notes: Note[]
  selectedNote: Note | null
  onRowClick: (note: Note) => void
  onSelectorClick: (noteId: string) => void
  onAssignSelector: (noteId: string, selectorId: number) => void
  onDeleteClick: (note: Note) => void
  getCategoryInfo: (categoryId?: string) => { id: number; name: string; color: string } | null
  formatNoteDate: (date: string | Date) => string
}

const ArticlesModule: Component<ArticlesModuleProps> = (props) => {
  const {
    searchQuery,
    setSearchQuery,
    titleColumnWidth,
    handleTitleColumnResize,
    filteredNotesForDisplay
  } = useArticles()

  const displayedNotes = () => filteredNotesForDisplay(props.notes)

  return (
    <div class="flex-1 sidebar-glass border-t border-macos-border">
      <div class="p-4 h-full">
        <SearchBar
          searchQuery={searchQuery()}
          onInput={setSearchQuery}
          notesCount={props.notes.length}
        />
        
        <ArticlesTable
          notes={displayedNotes()}
          selectedNote={props.selectedNote}
          searchQuery={searchQuery()}
          titleColumnWidth={titleColumnWidth()}
          onRowClick={props.onRowClick}
          onSelectorClick={props.onSelectorClick}
          onAssignSelector={props.onAssignSelector}
          onDeleteClick={props.onDeleteClick}
          onTitleColumnResize={handleTitleColumnResize}
          getCategoryInfo={props.getCategoryInfo}
          formatNoteDate={props.formatNoteDate}
        />
      </div>
    </div>
  )
}

export default ArticlesModule