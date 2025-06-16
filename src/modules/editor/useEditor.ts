import { createSignal, createEffect } from 'solid-js'
import { 
  selectedNote, 
  updateNote, 
  deleteNote, 
  togglePinNote,
  setSelectedNote,
  notes,
  createNote
} from '../../stores/noteStore'
import { preferences } from '../../stores/preferencesStore'
import { findWikiLinkAtCursor, getAutoCompleteMatches } from '../../utils/wikilinks'

export function useEditor() {
  const [noteTitle, setNoteTitle] = createSignal("")
  const [noteContent, setNoteContent] = createSignal("")
  const [showPreview, setShowPreview] = createSignal(false)
  const [lastSaved, setLastSaved] = createSignal<Date | null>(null)
  const [showAutoComplete, setShowAutoComplete] = createSignal(false)
  const [autoCompleteResults, setAutoCompleteResults] = createSignal<
    Array<{ title: string; id: string }>
  >([])
  const [autoCompletePosition, setAutoCompletePosition] = createSignal({
    top: 0,
    left: 0,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false)
  const [noteToDelete, setNoteToDelete] = createSignal<string | null>(null)

  // Sync selected note with editor state
  createEffect(() => {
    const note = selectedNote()
    if (note) {
      setNoteTitle(note.title)
      setNoteContent(note.content)
    } else {
      setNoteTitle("")
      setNoteContent("")
    }
  })

  const saveCurrentNote = () => {
    const note = selectedNote()
    if (note) {
      updateNote(note.id, {
        title: noteTitle() || "Untitled Note",
        content: noteContent(),
      })
      setLastSaved(new Date())
    }
  }

  const handleContentInput = (value: string) => {
    setNoteContent(value)
    
    // Check for WikiLink auto-completion
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (textarea) {
      const cursorPos = textarea.selectionStart || 0
      const wikiLinkInfo = findWikiLinkAtCursor(value, cursorPos)

      if (wikiLinkInfo.isInWikiLink && wikiLinkInfo.linkText !== undefined) {
        const matches = getAutoCompleteMatches(wikiLinkInfo.linkText, notes())
        setAutoCompleteResults(matches)

        if (matches.length > 0) {
          const rect = textarea.getBoundingClientRect()
          setAutoCompletePosition({
            top: rect.top + 20,
            left: rect.left + 10,
          })
          setShowAutoComplete(true)
        } else {
          setShowAutoComplete(false)
        }
      } else {
        setShowAutoComplete(false)
      }
    }
  }

  const handleTitleEnterPress = () => {
    // Move cursor to beginning of content area when Enter is pressed
    const contentTextarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (contentTextarea) {
      contentTextarea.focus()
      // Force cursor to absolute beginning, even if there's existing content
      setTimeout(() => {
        contentTextarea.setSelectionRange(0, 0)
        contentTextarea.scrollTop = 0 // Also scroll to top
      }, 0)
    }
  }

  const togglePreviewMode = () => {
    setShowPreview(!showPreview())
    saveCurrentNote() // Save before switching modes
  }

  const handleDelete = () => {
    const note = selectedNote()
    if (note) {
      if (preferences().editor.confirm_delete) {
        setNoteToDelete(note.id)
        setShowDeleteConfirm(true)
      } else {
        // Delete without confirmation
        deleteNote(note.id)
        setSelectedNote(null)
        setNoteTitle("")
        setNoteContent("")
      }
    }
  }

  const confirmDelete = () => {
    const noteId = noteToDelete()
    if (noteId) {
      deleteNote(noteId)
      setSelectedNote(null)
      setNoteTitle("")
      setNoteContent("")
      setShowDeleteConfirm(false)
      setNoteToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setNoteToDelete(null)
  }

  const handleWikiLinkClick = async (noteTitle: string, exists: boolean) => {
    if (exists) {
      // Find and navigate to existing note
      const targetNote = notes().find(
        (note) => note.title.toLowerCase() === noteTitle.toLowerCase()
      )
      if (targetNote) {
        setSelectedNote(targetNote)
      }
    } else {
      // Create new note
      const newNote = await createNote(noteTitle)
      if (newNote) {
        setSelectedNote(newNote)
      }
    }
  }

  const insertAutoComplete = (noteTitle: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const value = textarea.value
    const cursorPos = textarea.selectionStart || 0
    const wikiLinkInfo = findWikiLinkAtCursor(value, cursorPos)

    if (wikiLinkInfo.isInWikiLink && wikiLinkInfo.startPos !== undefined) {
      const beforeLink = value.slice(0, wikiLinkInfo.startPos)
      const afterCursor = value.slice(cursorPos)
      const newValue = beforeLink + `[[${noteTitle}]]` + afterCursor

      setNoteContent(newValue)
      setShowAutoComplete(false)

      // Set cursor position after the inserted link
      setTimeout(() => {
        const newCursorPos = beforeLink.length + `[[${noteTitle}]]`.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    }
  }

  const showVersionHistory = () => {
    const note = selectedNote()
    if (!note) return
    // Version history will be implemented with backend support
    alert("Version history will be available in a future update.")
  }

  const handleTogglePin = () => {
    const note = selectedNote()
    if (note) {
      togglePinNote(note.id)
    }
  }

  return {
    // State
    noteTitle,
    noteContent,
    showPreview,
    lastSaved,
    showAutoComplete,
    autoCompleteResults,
    autoCompletePosition,
    showDeleteConfirm,
    noteToDelete,
    
    // Actions
    setNoteTitle,
    setNoteContent,
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
  }
}