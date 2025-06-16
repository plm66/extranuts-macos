import { Component, Show, For } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { selectedNote, notes } from '../../stores/noteStore'
import { preferences } from '../../stores/preferencesStore'
import MarkdownPreview from '../../components/MarkdownPreview'
import TitleInput from './TitleInput'
import ContentEditor from './ContentEditor'
import EditorToolbar from './EditorToolbar'
import { useEditor } from './useEditor'

interface EditorProps {
  onShowCategoryManager: () => void
}

const Editor: Component<EditorProps> = (props) => {
  const {
    noteTitle,
    noteContent,
    showPreview,
    showAutoComplete,
    autoCompleteResults,
    autoCompletePosition,
    showDeleteConfirm,
    setNoteTitle,
    saveCurrentNote,
    handleContentInput,
    handleTitleEnterPress,
    togglePreviewMode,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleWikiLinkClick,
    insertAutoComplete,
    showVersionHistory,
    handleTogglePin,
    setShowAutoComplete
  } = useEditor()

  return (
    <>
      <Show
        when={selectedNote()}
        fallback={
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center opacity-50">
              <p class="text-macos-text-secondary text-sm">
                No note selected
              </p>
            </div>
          </div>
        }
      >
        <div class="flex-1 flex flex-col p-6">
          {/* Title Field */}
          <div class="flex items-center justify-between mb-1">
            <div class="flex-1 flex items-center gap-3">
              <TitleInput
                value={noteTitle()}
                onInput={setNoteTitle}
                onBlur={() => saveCurrentNote()}
                onEnterPress={handleTitleEnterPress}
                autoFocus={true}
              />
            </div>
            <EditorToolbar
              isPinned={selectedNote()?.isPinned}
              isPreviewMode={showPreview()}
              onTogglePin={handleTogglePin}
              onTogglePreview={togglePreviewMode}
              onShowVersionHistory={showVersionHistory}
              onShowCategoryManager={props.onShowCategoryManager}
              onDelete={handleDelete}
            />
          </div>

          {/* Content Editor/Preview */}
          <Show
            when={!showPreview()}
            fallback={
              <div class="flex-1 p-4 overflow-y-auto native-scrollbar leading-relaxed">
                <MarkdownPreview
                  content={noteContent()}
                  noteList={notes()}
                  onWikiLinkClick={handleWikiLinkClick}
                />
              </div>
            }
          >
            <div class="flex-1 flex flex-col">
              <ContentEditor
                value={noteContent()}
                onInput={handleContentInput}
                onBlur={saveCurrentNote}
                placeholder="Write your note with markdown support..."
              />
            </div>
          </Show>
        </div>
      </Show>

      {/* Auto-complete Dropdown */}
      <Show when={showAutoComplete()}>
        <div
          class="fixed z-50 bg-black/90 backdrop-blur-md border border-macos-border rounded-lg shadow-2xl max-w-xs"
          style={{
            top: `${autoCompletePosition().top}px`,
            left: `${autoCompletePosition().left}px`,
          }}
        >
          <div class="p-2">
            <div class="text-xs text-macos-text-secondary mb-2 px-2 flex items-center gap-1">
              <Icon icon="material-symbols:link" class="w-3 h-3" />
              Link to note:
            </div>
            <For each={autoCompleteResults()}>
              {(note, index) => (
                <div
                  class="px-3 py-2 hover:bg-macos-hover rounded cursor-pointer text-sm transition-colors"
                  onClick={() => insertAutoComplete(note.title)}
                >
                  <div class="font-medium">{note.title}</div>
                </div>
              )}
            </For>
            <Show when={autoCompleteResults().length === 0}>
              <div class="px-3 py-2 text-sm text-macos-text-secondary italic">
                No existing notes found
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Delete Confirmation Dialog */}
      <Show when={showDeleteConfirm()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-macos-bg border border-macos-border rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <h3 class="text-lg font-semibold mb-4">Delete Note?</h3>
            <p class="text-macos-text-secondary mb-6">
              Are you sure you want to delete "{selectedNote()?.title}"? This action cannot be undone.
            </p>
            <div class="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                class="px-4 py-2 hover-highlight rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

export default Editor