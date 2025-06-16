declare global {
  interface Window {
    debugBadges: {
      showNotes: () => void
      showCounts: () => void
      assignNote: (noteId: string, selectorId: number) => void
      getFirstNoteId: () => string | null
      testAssign: () => void
      checkSelector: (selectorId: number) => void
      testFlow: () => void
    }
  }
}

export {}