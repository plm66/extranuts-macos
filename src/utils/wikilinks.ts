export interface WikiLink {
  originalText: string
  noteTitle: string
  displayText?: string
  startIndex: number
  endIndex: number
  exists: boolean
}

export interface ParsedContent {
  text: string
  links: WikiLink[]
}

/**
 * Parse text for Obsidian-style wikilinks: [[Note Title]] and [[Note Title|Display Text]]
 */
export function parseWikiLinks(text: string, noteList: Array<{ title: string; id: string }>): ParsedContent {
  const links: WikiLink[] = []
  const wikiLinkRegex = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g
  
  let match
  while ((match = wikiLinkRegex.exec(text)) !== null) {
    const originalText = match[0]
    const noteTitle = match[1].trim()
    const displayText = match[3]?.trim()
    
    // Check if note exists in current note list
    const exists = noteList.some(note => note.title.toLowerCase() === noteTitle.toLowerCase())
    
    links.push({
      originalText,
      noteTitle,
      displayText,
      startIndex: match.index,
      endIndex: match.index + originalText.length,
      exists
    })
  }
  
  return {
    text,
    links
  }
}

/**
 * Render text with wikilinks as HTML/JSX elements
 */
export function renderWithWikiLinks(
  text: string, 
  noteList: Array<{ title: string; id: string }>,
  onLinkClick: (noteTitle: string, exists: boolean) => void
): string {
  const parsed = parseWikiLinks(text, noteList)
  
  if (parsed.links.length === 0) {
    return text
  }
  
  let result = text
  let offset = 0
  
  // Replace links from end to start to maintain correct indices
  parsed.links.reverse().forEach(link => {
    const displayText = link.displayText || link.noteTitle
    const className = link.exists ? 'wikilink-exists' : 'wikilink-missing'
    
    const linkElement = `<span class="${className}" data-note-title="${link.noteTitle}" data-exists="${link.exists}">${displayText}</span>`
    
    result = result.slice(0, link.startIndex) + linkElement + result.slice(link.endIndex)
  })
  
  return result
}

/**
 * Extract note titles for auto-completion when typing [[
 */
export function getAutoCompleteMatches(
  input: string, 
  noteList: Array<{ title: string; id: string }>,
  maxResults: number = 5
): Array<{ title: string; id: string }> {
  if (!input.trim()) return noteList.slice(0, maxResults)
  
  const query = input.toLowerCase()
  
  // Fuzzy search: exact matches first, then partial matches
  const exactMatches = noteList.filter(note => 
    note.title.toLowerCase() === query
  )
  
  const partialMatches = noteList.filter(note => 
    note.title.toLowerCase() !== query && 
    note.title.toLowerCase().includes(query)
  )
  
  const startsWithMatches = noteList.filter(note => 
    !note.title.toLowerCase().includes(query) &&
    note.title.toLowerCase().startsWith(query)
  )
  
  return [...exactMatches, ...partialMatches, ...startsWithMatches].slice(0, maxResults)
}

/**
 * Find cursor position relative to wikilink syntax
 */
export function findWikiLinkAtCursor(text: string, cursorPosition: number): {
  isInWikiLink: boolean
  linkText?: string
  startPos?: number
  endPos?: number
} {
  // Look for [[ before cursor and ]] after cursor
  const beforeCursor = text.slice(0, cursorPosition)
  const afterCursor = text.slice(cursorPosition)
  
  const lastOpenBracket = beforeCursor.lastIndexOf('[[')
  const lastCloseBracket = beforeCursor.lastIndexOf(']]')
  
  // Check if we're inside a wikilink
  if (lastOpenBracket > lastCloseBracket) {
    const nextCloseBracket = afterCursor.indexOf(']]')
    
    if (nextCloseBracket !== -1) {
      // We're inside a complete wikilink
      const startPos = lastOpenBracket
      const endPos = cursorPosition + nextCloseBracket + 2
      const linkText = text.slice(startPos + 2, endPos - 2)
      
      return {
        isInWikiLink: true,
        linkText,
        startPos,
        endPos
      }
    } else {
      // We're inside an incomplete wikilink
      const linkText = beforeCursor.slice(lastOpenBracket + 2)
      
      return {
        isInWikiLink: true,
        linkText,
        startPos: lastOpenBracket,
        endPos: cursorPosition
      }
    }
  }
  
  return { isInWikiLink: false }
}