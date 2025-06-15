// Simple markdown parser for basic formatting
// Supports: bold, italic, headers, lists, code blocks, links

export interface MarkdownToken {
  type: 'text' | 'bold' | 'italic' | 'header' | 'list-item' | 'code' | 'code-block' | 'link' | 'line-break';
  content: string;
  level?: number; // for headers
  ordered?: boolean; // for lists
  href?: string; // for links
  language?: string; // for code blocks
}

export function parseMarkdown(text: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = [];
  const lines = text.split('\n');
  
  let inCodeBlock = false;
  let codeBlockContent = '';
  let codeBlockLanguage = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        tokens.push({ 
          type: 'code-block', 
          content: codeBlockContent.trim(),
          language: codeBlockLanguage || undefined
        });
        codeBlockContent = '';
        codeBlockLanguage = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        // Extract language identifier if present
        codeBlockLanguage = line.slice(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }
    
    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      tokens.push({
        type: 'header',
        content: headerMatch[2],
        level: headerMatch[1].length
      });
      continue;
    }
    
    // Lists
    const unorderedListMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedListMatch) {
      tokens.push({
        type: 'list-item',
        content: parseInlineMarkdown(unorderedListMatch[1]),
        ordered: false
      });
      continue;
    }
    
    const orderedListMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedListMatch) {
      tokens.push({
        type: 'list-item',
        content: parseInlineMarkdown(orderedListMatch[1]),
        ordered: true
      });
      continue;
    }
    
    // Regular text with inline formatting
    if (line.trim()) {
      const inlineTokens = parseInlineMarkdown(line);
      tokens.push({ type: 'text', content: inlineTokens });
    } else if (i < lines.length - 1) {
      // Empty line (paragraph break)
      tokens.push({ type: 'line-break', content: '' });
    }
  }
  
  return tokens;
}

function parseInlineMarkdown(text: string): string {
  // Process inline elements: bold, italic, code, links
  let result = text;
  
  // Escape HTML
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Inline code (process before bold/italic to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return result;
}

export function renderMarkdownToHtml(tokens: MarkdownToken[]): string {
  let html = '';
  let currentList: { type: 'ul' | 'ol' | null; items: string[] } = { type: null, items: [] };
  
  const closeCurrentList = () => {
    if (currentList.type && currentList.items.length > 0) {
      const tag = currentList.type;
      html += `<${tag}>${currentList.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;
      currentList = { type: null, items: [] };
    }
  };
  
  for (const token of tokens) {
    // Close list if we encounter non-list item
    if (token.type !== 'list-item') {
      closeCurrentList();
    }
    
    switch (token.type) {
      case 'header':
        html += `<h${token.level} class="markdown-h${token.level}">${token.content}</h${token.level}>`;
        break;
        
      case 'list-item':
        const listType = token.ordered ? 'ol' : 'ul';
        if (currentList.type !== listType) {
          closeCurrentList();
          currentList.type = listType;
        }
        currentList.items.push(token.content);
        break;
        
      case 'code-block':
        // We'll handle code blocks specially in the preview component
        html += `<div class="code-block-placeholder" data-language="${token.language || ''}" data-code="${encodeURIComponent(token.content)}"></div>`;
        break;
        
      case 'text':
        html += `<p class="markdown-paragraph">${token.content}</p>`;
        break;
        
      case 'line-break':
        // Just add spacing between paragraphs
        break;
    }
  }
  
  // Close any remaining list
  closeCurrentList();
  
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Enhanced markdown with WikiLink support
export function enhanceMarkdownWithWikiLinks(html: string, wikiLinkParser: (content: string) => any): string {
  // This will be integrated with the existing WikiLink functionality
  // For now, return the HTML as-is
  return html;
}