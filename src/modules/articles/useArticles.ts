import { createSignal } from 'solid-js'

export function useArticles() {
  const [searchQuery, setSearchQuery] = createSignal("")
  const [titleColumnWidth, setTitleColumnWidth] = createSignal(200)

  const handleTitleColumnResize = (e: MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = titleColumnWidth()

    const handleResize = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newWidth = Math.max(100, Math.min(400, startWidth + deltaX))
      setTitleColumnWidth(newWidth)
    }

    const handleResizeEnd = () => {
      document.removeEventListener("mousemove", handleResize)
      document.removeEventListener("mouseup", handleResizeEnd)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    document.addEventListener("mousemove", handleResize)
    document.addEventListener("mouseup", handleResizeEnd)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  const filteredNotesForDisplay = (notes: any[]) => {
    const query = searchQuery().toLowerCase()
    if (!query) return notes

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    )
  }

  return {
    searchQuery,
    setSearchQuery,
    titleColumnWidth,
    handleTitleColumnResize,
    filteredNotesForDisplay
  }
}