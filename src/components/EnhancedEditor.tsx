import { Component, createSignal, onMount } from 'solid-js'
import { Icon } from '@iconify-icon/solid'

interface EnhancedEditorProps {
  value: string
  onInput: (value: string) => void
  onBlur: () => void
  placeholder?: string
}

const EnhancedEditor: Component<EnhancedEditorProps> = (props) => {
  let textareaRef: HTMLTextAreaElement | undefined
  const [showToolbar, setShowToolbar] = createSignal(false)
  
  const insertFormatting = (before: string, after: string = before) => {
    if (!textareaRef) return
    
    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const text = textareaRef.value
    const selectedText = text.substring(start, end)
    
    const newText = 
      text.substring(0, start) + 
      before + selectedText + after + 
      text.substring(end)
    
    props.onInput(newText)
    
    // Restore cursor position
    setTimeout(() => {
      if (!textareaRef) return
      const newCursorPos = start + before.length + selectedText.length + after.length
      textareaRef.setSelectionRange(newCursorPos, newCursorPos)
      textareaRef.focus()
    }, 0)
  }
  
  const insertAtCursor = (text: string) => {
    if (!textareaRef) return
    
    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const value = textareaRef.value
    
    const newText = value.substring(0, start) + text + value.substring(end)
    props.onInput(newText)
    
    // Set cursor after inserted text
    setTimeout(() => {
      if (!textareaRef) return
      const newCursorPos = start + text.length
      textareaRef.setSelectionRange(newCursorPos, newCursorPos)
      textareaRef.focus()
    }, 0)
  }
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Keyboard shortcuts for formatting
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertFormatting('**')
          break
        case 'i':
          e.preventDefault()
          insertFormatting('*')
          break
        case 'k':
          e.preventDefault()
          // Insert link
          const selectedText = textareaRef?.value.substring(
            textareaRef.selectionStart,
            textareaRef.selectionEnd
          ) || ''
          insertFormatting('[', '](url)')
          break
      }
    }
    
    // Tab for lists
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      insertAtCursor('  ')
    }
  }
  
  return (
    <div class="flex flex-col h-full">
      {/* Formatting Toolbar */}
      <div class="flex items-center gap-1 p-2 border-b border-macos-border bg-black/20">
        <button
          onClick={() => insertFormatting('**')}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Bold (⌘B)"
        >
          <Icon icon="material-symbols:format-bold" class="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('*')}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Italic (⌘I)"
        >
          <Icon icon="material-symbols:format-italic" class="w-4 h-4" />
        </button>
        <div class="w-px h-4 bg-macos-border mx-1" />
        <button
          onClick={() => insertAtCursor('# ')}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Heading"
        >
          <Icon icon="material-symbols:title" class="w-4 h-4" />
        </button>
        <button
          onClick={() => insertAtCursor('- ')}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Bullet List"
        >
          <Icon icon="material-symbols:format-list-bulleted" class="w-4 h-4" />
        </button>
        <button
          onClick={() => insertAtCursor('1. ')}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Numbered List"
        >
          <Icon icon="material-symbols:format-list-numbered" class="w-4 h-4" />
        </button>
        <div class="w-px h-4 bg-macos-border mx-1" />
        <button
          onClick={() => insertFormatting('`')}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Inline Code"
        >
          <Icon icon="material-symbols:code" class="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            // Insert cursor between the backticks so user can type language
            if (!textareaRef) return
            const start = textareaRef.selectionStart
            const end = textareaRef.selectionEnd
            const text = textareaRef.value
            
            const newText = 
              text.substring(0, start) + 
              '```\n\n```' + 
              text.substring(end)
            
            props.onInput(newText)
            
            // Position cursor after first ```
            setTimeout(() => {
              if (!textareaRef) return
              const newCursorPos = start + 3
              textareaRef.setSelectionRange(newCursorPos, newCursorPos)
              textareaRef.focus()
            }, 0)
          }}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Code Block"
        >
          <Icon icon="material-symbols:code-blocks" class="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const selectedText = textareaRef?.value.substring(
              textareaRef!.selectionStart,
              textareaRef!.selectionEnd
            ) || 'link text'
            insertFormatting(`[${selectedText}](`, ')')
          }}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Link (⌘K)"
        >
          <Icon icon="material-symbols:link" class="w-4 h-4" />
        </button>
        <div class="w-px h-4 bg-macos-border mx-1" />
        <button
          onClick={() => insertAtCursor('[[')}
          class="p-1.5 hover-highlight rounded text-sm"
          title="Wiki Link"
        >
          <Icon icon="material-symbols:hub" class="w-4 h-4" />
        </button>
        
        <div class="flex-1" />
        
        {/* Quick code language buttons */}
        <div class="flex items-center gap-1 mr-2">
          <span class="text-xs text-macos-text-secondary mr-1">Quick:</span>
          <button
            onClick={() => {
              if (!textareaRef) return
              const start = textareaRef.selectionStart
              const end = textareaRef.selectionEnd
              const text = textareaRef.value
              const selectedText = text.substring(start, end)
              
              const newText = 
                text.substring(0, start) + 
                '```bash\n' + (selectedText || '# ') + '\n```' + 
                text.substring(end)
              
              props.onInput(newText)
              
              setTimeout(() => {
                if (!textareaRef) return
                const newCursorPos = start + 8 + (selectedText ? 0 : 2)
                textareaRef.setSelectionRange(newCursorPos, newCursorPos)
                textareaRef.focus()
              }, 0)
            }}
            class="px-1.5 py-0.5 text-xs bg-black/30 hover:bg-black/50 rounded transition-colors"
            title="Insert Bash code block"
          >
            bash
          </button>
          <button
            onClick={() => {
              if (!textareaRef) return
              const start = textareaRef.selectionStart
              const end = textareaRef.selectionEnd
              const text = textareaRef.value
              const selectedText = text.substring(start, end)
              
              const newText = 
                text.substring(0, start) + 
                '```python\n' + (selectedText || '# ') + '\n```' + 
                text.substring(end)
              
              props.onInput(newText)
              
              setTimeout(() => {
                if (!textareaRef) return
                const newCursorPos = start + 10 + (selectedText ? 0 : 2)
                textareaRef.setSelectionRange(newCursorPos, newCursorPos)
                textareaRef.focus()
              }, 0)
            }}
            class="px-1.5 py-0.5 text-xs bg-black/30 hover:bg-black/50 rounded transition-colors"
            title="Insert Python code block"
          >
            python
          </button>
        </div>
        
        <div class="text-xs text-macos-text-secondary px-2">
          Markdown supported
        </div>
      </div>
      
      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={props.value}
        onInput={(e) => props.onInput(e.target.value)}
        onBlur={props.onBlur}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder}
        class="flex-1 bg-transparent border-none outline-none text-macos-text resize-none no-drag native-scrollbar leading-relaxed p-4"
        style={{
          "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          "line-height": "1.6"
        }}
      />
    </div>
  )
}

export default EnhancedEditor