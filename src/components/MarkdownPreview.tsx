import { Component, createMemo, createEffect, onCleanup } from 'solid-js'
import { render } from 'solid-js/web'
import { parseMarkdown, renderMarkdownToHtml } from '../utils/markdown'
import { parseWikiLinks } from '../utils/wikilinks'
import CodeBlock from './CodeBlock'
import { themeStore } from '../stores/themeStore'
import type { Note } from '../types'

interface MarkdownPreviewProps {
  content: string
  noteList: Note[]
  onWikiLinkClick: (noteTitle: string, exists: boolean) => void
}

const MarkdownPreview: Component<MarkdownPreviewProps> = (props) => {
  let containerRef: HTMLDivElement | undefined
  
  const processedContent = createMemo(() => {
    // First, parse WikiLinks
    const wikiLinkParsed = parseWikiLinks(props.content, props.noteList)
    let processedText = props.content
    
    // Replace WikiLinks with temporary placeholders
    const wikiLinkPlaceholders: { [key: string]: { title: string; exists: boolean } } = {}
    let placeholderIndex = 0
    
    // Process links in reverse order to maintain correct indices
    const reversedLinks = wikiLinkParsed.links.slice().reverse()
    reversedLinks.forEach(link => {
      const placeholder = `__WIKILINK_${placeholderIndex}__`
      wikiLinkPlaceholders[placeholder] = {
        title: link.noteTitle,
        exists: link.exists
      }
      
      processedText = 
        processedText.slice(0, link.startIndex) + 
        placeholder + 
        processedText.slice(link.endIndex)
      
      placeholderIndex++
    })
    
    // Parse markdown
    const tokens = parseMarkdown(processedText)
    let html = renderMarkdownToHtml(tokens)
    
    // Replace WikiLink placeholders with actual links
    Object.entries(wikiLinkPlaceholders).forEach(([placeholder, linkInfo]) => {
      const className = linkInfo.exists ? 'wikilink-exists' : 'wikilink-missing'
      const linkHtml = `<span class="${className} cursor-pointer" data-wiki-title="${linkInfo.title}" data-wiki-exists="${linkInfo.exists}">${linkInfo.title}</span>`
      html = html.replace(placeholder, linkHtml)
    })
    
    return html
  })
  
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Check if clicked on a WikiLink
    if (target.dataset.wikiTitle) {
      const title = target.dataset.wikiTitle
      const exists = target.dataset.wikiExists === 'true'
      props.onWikiLinkClick(title, exists)
    }
  }
  
  // Keep track of rendered code blocks for cleanup
  const renderedCodeBlocks: Array<() => void> = []
  
  // Process code blocks after render
  createEffect(() => {
    // Track the processed content to trigger re-runs
    processedContent()
    
    // Clean up previous renders
    renderedCodeBlocks.forEach(dispose => dispose())
    renderedCodeBlocks.length = 0
    
    // Process after DOM updates
    setTimeout(() => {
      if (!containerRef) return
      
      const placeholders = containerRef.querySelectorAll('.code-block-placeholder')
      placeholders.forEach(placeholder => {
        const language = placeholder.getAttribute('data-language') || undefined
        const code = decodeURIComponent(placeholder.getAttribute('data-code') || '')
        
        // Create a container for the CodeBlock component
        const container = document.createElement('div')
        placeholder.replaceWith(container)
        
        // Render the CodeBlock component and store dispose function
        const dispose = render(() => <CodeBlock code={code} language={language} />, container)
        renderedCodeBlocks.push(dispose)
      })
    }, 0)
  })
  
  // Cleanup on unmount
  onCleanup(() => {
    renderedCodeBlocks.forEach(dispose => dispose())
  })
  
  return (
    <div 
      ref={containerRef}
      class={`markdown-preview prose ${themeStore.isDark() ? 'prose-invert' : 'prose-slate'} max-w-none`}
      innerHTML={processedContent()}
      onClick={handleClick}
    />
  )
}

export default MarkdownPreview