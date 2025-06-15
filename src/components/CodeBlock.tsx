import { Component, createSignal, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { highlightCode, renderHighlightedCode } from '../utils/syntaxHighlight'

interface CodeBlockProps {
  code: string
  language?: string
}

const CodeBlock: Component<CodeBlockProps> = (props) => {
  const [copied, setCopied] = createSignal(false)
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const highlightedCode = () => {
    if (props.language) {
      const tokens = highlightCode(props.code, props.language)
      return renderHighlightedCode(tokens)
    }
    return escapeHtml(props.code)
  }
  
  return (
    <div class="relative group">
      <div class="markdown-code-block">
        <div class="flex items-center justify-between mb-2 pb-2 border-b border-macos-border">
          <span class="text-xs text-macos-text-secondary font-mono">
            {props.language || 'plaintext'}
          </span>
          <button
            onClick={copyToClipboard}
            class="flex items-center gap-1 px-2 py-1 text-xs bg-black/30 hover:bg-black/50 rounded transition-colors"
            title="Copy code"
          >
            <Show
              when={!copied()}
              fallback={
                <>
                  <Icon icon="material-symbols:check" class="w-3 h-3" />
                  <span>Copied!</span>
                </>
              }
            >
              <Icon icon="material-symbols:content-copy-outline" class="w-3 h-3" />
              <span>Copy</span>
            </Show>
          </button>
        </div>
        <pre class="overflow-x-auto">
          <code innerHTML={highlightedCode()} />
        </pre>
      </div>
    </div>
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default CodeBlock