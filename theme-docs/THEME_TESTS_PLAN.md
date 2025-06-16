# Plan de Tests - Système de Thèmes

## 🧪 Tests Unitaires

### ThemeStore Tests

#### Tests de Base
```typescript
describe('ThemeStore', () => {
  
  test('devrait initialiser avec le thème dark par défaut', () => {
    expect(theme()).toBe('dark')
    expect(isDark()).toBe(true)
    expect(isLight()).toBe(false)
  })

  test('devrait basculer entre dark et light', () => {
    setTheme('light')
    expect(theme()).toBe('light')
    expect(isLight()).toBe(true)
    expect(isDark()).toBe(false)
  })

  test('devrait detecter le thème système en mode auto', () => {
    // Mock du media query système
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => ({
        matches: true, // Simule dark mode système
        addListener: jest.fn(),
        removeListener: jest.fn()
      }))
    })
    
    setTheme('auto')
    expect(theme()).toBe('auto')
    expect(isDark()).toBe(true) // Basé sur le système
  })

  test('devrait réagir aux changements système', () => {
    const mockMatchMedia = jest.fn()
    window.matchMedia = mockMatchMedia
    
    let listener: (event: any) => void
    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: (fn: any) => { listener = fn },
      removeListener: jest.fn()
    })
    
    setTheme('auto')
    
    // Simule changement système vers dark
    listener!({ matches: true })
    expect(isDark()).toBe(true)
  })
})
```

#### Tests de Persistance
```typescript
describe('Theme Persistence', () => {
  
  test('devrait sauvegarder le thème dans les préférences', async () => {
    const mockSavePreferences = jest.fn()
    
    await setTheme('light')
    
    expect(mockSavePreferences).toHaveBeenCalledWith(
      expect.objectContaining({
        appearance: { theme: 'light' }
      })
    )
  })

  test('devrait restaurer le thème au démarrage', () => {
    // Mock préférences sauvegardées
    const mockPreferences = {
      appearance: { theme: 'light' }
    }
    
    initializeTheme(mockPreferences)
    expect(theme()).toBe('light')
  })

  test('devrait fallback sur dark si préférences corrompues', () => {
    const mockPreferences = {
      appearance: { theme: 'invalid' }
    }
    
    initializeTheme(mockPreferences)
    expect(theme()).toBe('dark')
  })
})
```

### ThemeToggle Component Tests

#### Tests d'Interaction
```typescript
describe('ThemeToggle Component', () => {
  
  test('devrait afficher le thème actuel', () => {
    setTheme('dark')
    render(<ThemeToggle />)
    
    expect(screen.getByText('Sombre')).toBeInTheDocument()
  })

  test('devrait changer de thème au clic', () => {
    setTheme('dark')
    render(<ThemeToggle />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(theme()).toBe('light')
  })

  test('devrait afficher les 3 options en mode dropdown', () => {
    render(<ThemeToggle />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByText('Sombre')).toBeInTheDocument()
    expect(screen.getByText('Clair')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
  })

  test('devrait indiquer le mode auto avec icône système', () => {
    setTheme('auto')
    render(<ThemeToggle />)
    
    expect(screen.getByTestId('system-icon')).toBeInTheDocument()
  })
})
```

#### Tests d'État Visuel
```typescript
describe('ThemeToggle Visual States', () => {
  
  test('devrait appliquer les styles dark en mode sombre', () => {
    setTheme('dark')
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-macos-bg', 'text-macos-text')
  })

  test('devrait appliquer les styles light en mode clair', () => {
    setTheme('light')
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('theme-light')
  })

  test('devrait gérer les états hover correctement', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    fireEvent.mouseEnter(button)
    expect(button).toHaveClass('hover-highlight')
  })
})
```

### Preferences Integration Tests

```typescript
describe('Preferences Theme Integration', () => {
  
  test('devrait sauvegarder le thème via Tauri', async () => {
    const mockInvoke = jest.fn()
    window.__TAURI__ = { invoke: mockInvoke }
    
    await setTheme('light')
    
    expect(mockInvoke).toHaveBeenCalledWith(
      'save_preferences',
      expect.objectContaining({
        appearance: { theme: 'light' }
      })
    )
  })

  test('devrait charger le thème depuis Tauri', async () => {
    const mockInvoke = jest.fn().mockResolvedValue({
      appearance: { theme: 'light' }
    })
    window.__TAURI__ = { invoke: mockInvoke }
    
    await loadPreferences()
    
    expect(theme()).toBe('light')
  })
})
```

## 🔗 Tests d'Intégration

### Changement de Thème Global

#### Test End-to-End Complet
```typescript
describe('Global Theme Switch Integration', () => {
  
  test('devrait propager le changement de thème à toute l\'application', async () => {
    // Setup composants multiples
    render(
      <App>
        <SettingsPanel />
        <EnhancedEditor />
        <MarkdownPreview />
      </App>
    )
    
    // Changement via settings
    const themeToggle = screen.getByTestId('theme-toggle')
    fireEvent.click(themeToggle)
    
    // Vérification propagation
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'light')
      expect(screen.getByTestId('editor')).toHaveClass('theme-light')
      expect(screen.getByTestId('preview')).toHaveClass('theme-light')
    })
  })

  test('devrait maintenir l\'état du thème lors de navigation', () => {
    setTheme('light')
    
    // Simulation changement de vue
    render(<App />)
    
    // Navigation vers settings
    fireEvent.click(screen.getByTestId('settings-button'))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    
    // Retour vue principale
    fireEvent.click(screen.getByTestId('back-button'))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })
})
```

### Persistance Entre Sessions

```typescript
describe('Theme Persistence Across Sessions', () => {
  
  test('devrait restaurer le thème après redémarrage', async () => {
    // Simulation première session
    setTheme('light')
    await waitFor(() => {
      expect(mockTauriInvoke).toHaveBeenCalledWith('save_preferences')
    })
    
    // Simulation nouveau démarrage
    cleanup()
    mockTauriInvoke.mockResolvedValue({
      appearance: { theme: 'light' }
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(theme()).toBe('light')
      expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    })
  })

  test('devrait gérer la migration des anciennes préférences', async () => {
    // Mock anciennes préférences sans thème
    mockTauriInvoke.mockResolvedValue({
      window: { transparency: 0.8 }
      // Pas de appearance.theme
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(theme()).toBe('dark') // Fallback
    })
  })
})
```

### Détection Système Auto

```typescript
describe('Auto System Theme Detection', () => {
  
  test('devrait suivre les changes système en temps réel', () => {
    let mediaQueryListener: (e: any) => void
    
    const mockMatchMedia = jest.fn(() => ({
      matches: false, // Initialement light
      addListener: (fn: any) => { mediaQueryListener = fn },
      removeListener: jest.fn()
    }))
    
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia
    })
    
    setTheme('auto')
    expect(isLight()).toBe(true)
    
    // Système change vers dark
    mediaQueryListener!({ matches: true })
    expect(isDark()).toBe(true)
    
    // Retour vers light
    mediaQueryListener!({ matches: false })
    expect(isLight()).toBe(true)
  })

  test('devrait conserver le mode auto après changements système', () => {
    setTheme('auto')
    
    // Changement système ne doit pas affecter le mode
    triggerSystemThemeChange(true)
    expect(theme()).toBe('auto') // Toujours auto
    expect(isDark()).toBe(true)  // Mais rendu dark
  })
})
```

## 👁️ Tests Visuels

### Tests de Contraste WCAG AA

#### Tests Automatisés de Contraste
```typescript
describe('WCAG AA Contrast Tests', () => {
  
  test('devrait respecter le contraste minimum pour le texte principal', () => {
    setTheme('light')
    
    const textColor = getCSSVariable('--theme-text-primary')
    const bgColor = getCSSVariable('--theme-bg-primary')
    
    const contrast = calculateContrast(textColor, bgColor)
    expect(contrast).toBeGreaterThanOrEqual(4.5) // WCAG AA Normal
  })

  test('devrait respecter le contraste pour le texte large', () => {
    setTheme('light')
    
    const titleColor = getCSSVariable('--theme-text-primary')
    const bgColor = getCSSVariable('--theme-bg-primary')
    
    const contrast = calculateContrast(titleColor, bgColor)
    expect(contrast).toBeGreaterThanOrEqual(3.0) // WCAG AA Large
  })

  test('devrait valider le contraste des liens et boutons', () => {
    setTheme('light')
    
    const accentColor = getCSSVariable('--theme-accent-primary')
    const bgColor = getCSSVariable('--theme-bg-primary')
    
    const contrast = calculateContrast(accentColor, bgColor)
    expect(contrast).toBeGreaterThanOrEqual(4.5)
  })
})
```

#### Tests Thème Sombre
```typescript
describe('Dark Theme Contrast', () => {
  
  test('devrait valider tous les contrastes en mode sombre', () => {
    setTheme('dark')
    
    const testCases = [
      ['--theme-text-primary', '--theme-bg-primary', 4.5],
      ['--theme-text-secondary', '--theme-bg-primary', 3.0],
      ['--theme-accent-primary', '--theme-bg-primary', 4.5],
      ['--theme-text-primary', '--theme-bg-secondary', 4.5]
    ]
    
    testCases.forEach(([foreground, background, minContrast]) => {
      const fgColor = getCSSVariable(foreground)
      const bgColor = getCSSVariable(background)
      const contrast = calculateContrast(fgColor, bgColor)
      
      expect(contrast).toBeGreaterThanOrEqual(minContrast)
    })
  })
})
```

### Tests de Lisibilité Composants

#### Tests Snapshot Visuels
```typescript
describe('Component Visual Consistency', () => {
  
  test('devrait maintenir l\'apparence des composants principaux', () => {
    const components = [
      <EnhancedEditor />,
      <SettingsPanel />,
      <MarkdownPreview />,
      <CategorySelector />
    ]
    
    ['dark', 'light'].forEach(themeName => {
      setTheme(themeName)
      
      components.forEach((component, index) => {
        const { container } = render(component)
        expect(container.firstChild).toMatchSnapshot(
          `component-${index}-${themeName}-theme`
        )
      })
    })
  })
})
```

#### Tests de Lisibilité Markdown
```typescript
describe('Markdown Readability Tests', () => {
  
  test('devrait maintenir la lisibilité du code syntax highlighting', () => {
    const codeBlock = `
      function example() {
        const variable = "string";
        return variable;
      }
    `
    
    ['dark', 'light'].forEach(themeName => {
      setTheme(themeName)
      render(<MarkdownPreview content={codeBlock} />)
      
      // Test contraste éléments de code
      const keywords = screen.getAllByClassName('syntax-keyword')
      const strings = screen.getAllByClassName('syntax-string')
      
      keywords.forEach(element => {
        expect(element).toHaveAccessibleContrast()
      })
      
      strings.forEach(element => {
        expect(element).toHaveAccessibleContrast()
      })
    })
  })

  test('devrait valider les wikilinks dans les deux thèmes', () => {
    const content = "Voici un [[lien wiki]] et [[lien manquant]]"
    
    ['dark', 'light'].forEach(themeName => {
      setTheme(themeName)
      render(<MarkdownPreview content={content} />)
      
      const existingLinks = screen.getAllByClassName('wikilink-exists')
      const missingLinks = screen.getAllByClassName('wikilink-missing')
      
      [...existingLinks, ...missingLinks].forEach(link => {
        expect(link).toHaveAccessibleContrast()
        expect(link).toBeVisible()
      })
    })
  })
})
```

### Tests de Cohérence Visuelle

#### Audit Complet Interface
```typescript
describe('Visual Consistency Audit', () => {
  
  test('devrait appliquer le glassmorphism uniformément', () => {
    setTheme('dark')
    
    const glassElements = [
      '.glass-morphism',
      '.sidebar-glass',
      '.modal-glass'
    ]
    
    glassElements.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        const styles = getComputedStyle(element)
        expect(styles.backdropFilter).toContain('blur')
        expect(styles.background).toContain('rgba')
      })
    })
  })

  test('devrait maintenir les espacements et tailles de police', () => {
    ['dark', 'light'].forEach(themeName => {
      setTheme(themeName)
      
      // Vérification tailles cohérentes
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        const fontSize = getComputedStyle(heading).fontSize
        expect(fontSize).toMatch(/\d+px/)
      })
      
      // Vérification espacements
      const sections = document.querySelectorAll('section, article, div[class*="panel"]')
      sections.forEach(section => {
        const padding = getComputedStyle(section).padding
        expect(padding).toBeDefined()
      })
    })
  })
})
```

## 🚀 Test d'Intégration Performance

### Tests de Performance Changement de Thème
```typescript
describe('Theme Switch Performance', () => {
  
  test('devrait changer de thème en moins de 16ms', async () => {
    const startTime = performance.now()
    
    setTheme('light')
    
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    })
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(16) // 1 frame à 60fps
  })

  test('devrait éviter les layouts thrashing lors du changement', () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const layoutShifts = entries.filter(entry => entry.entryType === 'layout-shift')
      expect(layoutShifts.length).toBe(0)
    })
    
    observer.observe({ entryTypes: ['layout-shift'] })
    
    setTheme('light')
    setTheme('dark')
    
    setTimeout(() => observer.disconnect(), 100)
  })
})
```

## 🔧 Utilities de Test

### Custom Matchers
```typescript
expect.extend({
  toHaveAccessibleContrast(element) {
    const styles = getComputedStyle(element)
    const textColor = styles.color
    const bgColor = styles.backgroundColor
    
    const contrast = calculateContrast(textColor, bgColor)
    const pass = contrast >= 4.5
    
    return {
      pass,
      message: () => 
        `expected element to have accessible contrast (${contrast}), minimum is 4.5`
    }
  }
})
```

### Helper Functions
```typescript
const getCSSVariable = (variable: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

const calculateContrast = (color1: string, color2: string): number => {
  // Implémentation calcul contraste WCAG
  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)
  
  const brighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)
  
  return (brighter + 0.05) / (darker + 0.05)
}
```