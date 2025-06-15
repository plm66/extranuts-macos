// Lightweight syntax highlighting for code blocks
// Supports: bash, shell, python, javascript, typescript

export interface HighlightToken {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'variable' | 'text';
  content: string;
}

// Language-specific keywords
const LANGUAGE_CONFIGS = {
  bash: {
    keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'exit', 'echo', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'sed', 'awk', 'curl', 'wget', 'chmod', 'chown', 'sudo', 'apt', 'yum', 'brew', 'npm', 'pip', 'git', 'docker', 'export', 'source', 'alias', 'unset', 'set', 'shift', 'break', 'continue'],
    stringDelimiters: ['"', "'"],
    commentStart: '#',
    operators: ['=', '==', '!=', '-eq', '-ne', '-gt', '-lt', '-ge', '-le', '&&', '||', '|', '&', ';', '>', '<', '>>', '<<', '2>', '2>&1'],
    variablePrefix: '$'
  },
  python: {
    keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'yield', 'assert', 'pass', 'raise', 'del', 'global', 'nonlocal', 'in', 'is', 'not', 'and', 'or', 'True', 'False', 'None', 'self', 'async', 'await'],
    builtins: ['print', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'open', 'input', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'sum', 'min', 'max', 'abs', 'round', 'all', 'any'],
    stringDelimiters: ['"', "'", '"""', "'''"],
    commentStart: '#',
    operators: ['=', '==', '!=', '>', '<', '>=', '<=', '+', '-', '*', '/', '//', '%', '**', '&', '|', '^', '~', '<<', '>>', 'and', 'or', 'not', 'in', 'is', '+=', '-=', '*=', '/='],
    decoratorPrefix: '@'
  },
  javascript: {
    keywords: ['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'return', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'class', 'extends', 'constructor', 'super', 'this', 'import', 'export', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'null', 'undefined', 'true', 'false'],
    builtins: ['console', 'log', 'error', 'warn', 'info', 'debug', 'alert', 'prompt', 'confirm', 'parseInt', 'parseFloat', 'JSON', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet'],
    stringDelimiters: ['"', "'", '`'],
    commentStart: '//',
    multilineCommentStart: '/*',
    multilineCommentEnd: '*/',
    operators: ['=', '==', '===', '!=', '!==', '>', '<', '>=', '<=', '+', '-', '*', '/', '%', '**', '&', '|', '^', '~', '<<', '>>', '>>>', '&&', '||', '!', '?', ':', '+=', '-=', '*=', '/=', '=>'],
  },
  typescript: {
    keywords: ['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'return', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'class', 'extends', 'constructor', 'super', 'this', 'import', 'export', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'null', 'undefined', 'true', 'false', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'private', 'protected', 'public', 'static', 'readonly', 'implements', 'keyof', 'never', 'any', 'unknown'],
    builtins: ['console', 'log', 'error', 'warn', 'info', 'debug', 'alert', 'prompt', 'confirm', 'parseInt', 'parseFloat', 'JSON', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet'],
    stringDelimiters: ['"', "'", '`'],
    commentStart: '//',
    multilineCommentStart: '/*',
    multilineCommentEnd: '*/',
    operators: ['=', '==', '===', '!=', '!==', '>', '<', '>=', '<=', '+', '-', '*', '/', '%', '**', '&', '|', '^', '~', '<<', '>>', '>>>', '&&', '||', '!', '?', ':', '+=', '-=', '*=', '/=', '=>'],
    typeAnnotation: ':'
  }
}

// Alias shell to bash
LANGUAGE_CONFIGS.shell = LANGUAGE_CONFIGS.bash;
LANGUAGE_CONFIGS.sh = LANGUAGE_CONFIGS.bash;
LANGUAGE_CONFIGS.js = LANGUAGE_CONFIGS.javascript;
LANGUAGE_CONFIGS.ts = LANGUAGE_CONFIGS.typescript;
LANGUAGE_CONFIGS.py = LANGUAGE_CONFIGS.python;

export function highlightCode(code: string, language: string): HighlightToken[] {
  const config = LANGUAGE_CONFIGS[language.toLowerCase()];
  if (!config) {
    // No highlighting for unsupported languages
    return [{ type: 'text', content: code }];
  }

  const tokens: HighlightToken[] = [];
  let i = 0;

  while (i < code.length) {
    let matched = false;

    // Check for comments
    if (config.commentStart && code.slice(i).startsWith(config.commentStart)) {
      const endOfLine = code.indexOf('\n', i);
      const commentEnd = endOfLine === -1 ? code.length : endOfLine;
      tokens.push({ type: 'comment', content: code.slice(i, commentEnd) });
      i = commentEnd;
      matched = true;
    }
    // Check for multiline comments (JS/TS)
    else if (config.multilineCommentStart && code.slice(i).startsWith(config.multilineCommentStart)) {
      const commentEnd = code.indexOf(config.multilineCommentEnd, i + config.multilineCommentStart.length);
      if (commentEnd !== -1) {
        tokens.push({ type: 'comment', content: code.slice(i, commentEnd + config.multilineCommentEnd.length) });
        i = commentEnd + config.multilineCommentEnd.length;
      } else {
        tokens.push({ type: 'comment', content: code.slice(i) });
        i = code.length;
      }
      matched = true;
    }

    // Check for strings
    if (!matched) {
      for (const delimiter of config.stringDelimiters) {
        if (code.slice(i).startsWith(delimiter)) {
          let j = i + delimiter.length;
          let escaped = false;
          
          while (j < code.length) {
            if (escaped) {
              escaped = false;
            } else if (code[j] === '\\') {
              escaped = true;
            } else if (code.slice(j).startsWith(delimiter)) {
              j += delimiter.length;
              break;
            }
            j++;
          }
          
          tokens.push({ type: 'string', content: code.slice(i, j) });
          i = j;
          matched = true;
          break;
        }
      }
    }

    // Check for numbers
    if (!matched && /[0-9]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[0-9._]/.test(code[j])) {
        j++;
      }
      tokens.push({ type: 'number', content: code.slice(i, j) });
      i = j;
      matched = true;
    }

    // Check for variables (bash/shell)
    if (!matched && config.variablePrefix && code[i] === config.variablePrefix) {
      let j = i + 1;
      // Handle ${VAR} syntax
      if (code[j] === '{') {
        const closeIndex = code.indexOf('}', j);
        if (closeIndex !== -1) {
          tokens.push({ type: 'variable', content: code.slice(i, closeIndex + 1) });
          i = closeIndex + 1;
          matched = true;
        }
      } else {
        // Handle $VAR syntax
        while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
          j++;
        }
        if (j > i + 1) {
          tokens.push({ type: 'variable', content: code.slice(i, j) });
          i = j;
          matched = true;
        }
      }
    }

    // Check for decorators (Python)
    if (!matched && config.decoratorPrefix && code[i] === config.decoratorPrefix) {
      let j = i + 1;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
        j++;
      }
      if (j > i + 1) {
        tokens.push({ type: 'function', content: code.slice(i, j) });
        i = j;
        matched = true;
      }
    }

    // Check for words (keywords, functions, etc.)
    if (!matched && /[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
        j++;
      }
      
      const word = code.slice(i, j);
      
      if (config.keywords.includes(word)) {
        tokens.push({ type: 'keyword', content: word });
      } else if (config.builtins && config.builtins.includes(word)) {
        tokens.push({ type: 'function', content: word });
      } else {
        // Check if it's a function call
        let k = j;
        while (k < code.length && /\s/.test(code[k])) k++;
        if (code[k] === '(') {
          tokens.push({ type: 'function', content: word });
        } else {
          tokens.push({ type: 'text', content: word });
        }
      }
      
      i = j;
      matched = true;
    }

    // Check for operators
    if (!matched) {
      let operatorFound = false;
      for (const op of config.operators.sort((a, b) => b.length - a.length)) {
        if (code.slice(i).startsWith(op)) {
          tokens.push({ type: 'operator', content: op });
          i += op.length;
          operatorFound = true;
          matched = true;
          break;
        }
      }
    }

    // Default: single character
    if (!matched) {
      tokens.push({ type: 'text', content: code[i] });
      i++;
    }
  }

  return tokens;
}

export function renderHighlightedCode(tokens: HighlightToken[]): string {
  return tokens.map(token => {
    const content = escapeHtml(token.content);
    switch (token.type) {
      case 'keyword':
        return `<span class="syntax-keyword">${content}</span>`;
      case 'string':
        return `<span class="syntax-string">${content}</span>`;
      case 'comment':
        return `<span class="syntax-comment">${content}</span>`;
      case 'number':
        return `<span class="syntax-number">${content}</span>`;
      case 'operator':
        return `<span class="syntax-operator">${content}</span>`;
      case 'function':
        return `<span class="syntax-function">${content}</span>`;
      case 'variable':
        return `<span class="syntax-variable">${content}</span>`;
      default:
        return content;
    }
  }).join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}