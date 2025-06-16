# Guide de Migration Visuelle - Light Theme

## 🎯 Vue d'Ensemble

Ce guide recense tous les composants à adapter pour le light theme et fournit des recommandations spécifiques par composant.

## 📋 Composants à Adapter

### 1. App.tsx (Composant Principal)
**Éléments concernés :**
- Sidebar background
- Main content area
- Drag regions
- Window borders

**Actions requises :**
```tsx
// Ajouter data-theme attribute sur root
<div data-theme={currentTheme} class="app-container">
```

**Classes à adapter :**
- `.sidebar-glass` → `.sidebar-glass-light`
- `.glass-morphism` → `.glass-morphism-light`

### 2. EnhancedEditor.tsx
**Éléments concernés :**
- Éditeur background
- Texte principal
- Curseur et sélection
- Auto-complétion popup

**Classes critiques :**
```css
/* Adapter pour light theme */
.editor-container
.editor-content
.autocomplete-popup
.selection-highlight
```

**Points d'attention :**
- Contraste curseur sur fond clair
- Lisibilité texte sélectionné
- Visibilité auto-complétion

### 3. MarkdownPreview.tsx
**Éléments concernés :**
- Tous les éléments markdown (h1-h6, p, code, links)
- Code blocks avec syntax highlighting
- WikiLinks styling

**Classes à créer :**
```css
.markdown-preview-light .markdown-h1 { color: var(--light-text-primary); }
.markdown-preview-light .markdown-code-block { 
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

### 4. SettingsPanel.tsx
**Éléments concernés :**
- Panel background
- Toggle switches
- Buttons et inputs
- Theme selector (nouveau bouton)

**Nouveau composant à ajouter :**
```tsx
const ThemeToggle = () => (
  <button onClick={toggleTheme} class="theme-toggle">
    <Show when={currentTheme() === 'dark'} fallback={<MoonIcon />}>
      <SunIcon />
    </Show>
  </button>
)
```

### 5. CategorySelector.tsx & CategoryManager.tsx
**Éléments concernés :**
- Dropdown backgrounds
- Category pills/badges
- Hover states
- Border colors

**Adaptation couleurs catégories :**
- Utiliser les variants `-light` des couleurs catégories
- Adapter les backgrounds glass pour chaque catégorie

### 6. ExportModal.tsx
**Éléments concernés :**
- Modal background
- Overlay backdrop
- Form controls
- Progress indicators

**Classes à adapter :**
```css
.modal-overlay-light { background: rgba(0, 0, 0, 0.3); }
.modal-content-light { background: var(--light-bg-primary); }
```

### 7. CodeBlock.tsx
**Éléments concernés :**
- Code background
- Copy button
- Language label
- Syntax highlighting (utiliser SYNTAX_COLORS_LIGHT.md)

**Implémentation prioritaire :**
- Appliquer les nouvelles couleurs syntax
- Adapter le background du code block
- Améliorer visibilité du bouton copy

### 8. KeyboardShortcuts.tsx
**Éléments concernés :**
- Help panel background
- Shortcut key styling
- Text readability

## 🚨 Pièges à Éviter

### 1. Contraste Insuffisant
```css
/* ❌ ÉVITER */
color: #CCCCCC; /* Sur fond blanc = illisible */

/* ✅ CORRECT */
color: rgba(33, 37, 41, 0.95); /* Contraste 4.5:1 minimum */
```

### 2. Oubli des États Interactifs
```css
/* ❌ INCOMPLET */
.button-light { color: #333; }

/* ✅ COMPLET */
.button-light { color: #333; }
.button-light:hover { color: #000; background: rgba(0,0,0,0.05); }
.button-light:focus { outline: 2px solid #3B82F6; }
.button-light:disabled { color: #999; }
```

### 3. Scrollbars Non Adaptées
```css
/* ❌ Scrollbar dark sur fond light */
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); }

/* ✅ Scrollbar adaptée */
::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); }
```

### 4. Ombres Portées Manquantes
En light theme, les ombres sont CRITIQUES pour la définition des éléments.

```css
/* ❌ Sans ombre = éléments perdus */
.card-light { background: white; }

/* ✅ Avec ombre = définition claire */
.card-light { 
  background: white; 
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

## 📐 Ordre de Migration Recommandé

### Phase 1 - Foundation (Critique)
1. **Variables CSS thématiques** dans index.css
2. **App.tsx** - Structure principale
3. **Système de switch theme** dans SettingsPanel

### Phase 2 - Contenu (Essentiel)  
4. **EnhancedEditor.tsx** - Zone d'édition principale
5. **MarkdownPreview.tsx** - Rendu markdown
6. **CodeBlock.tsx** - Syntax highlighting

### Phase 3 - Interface (Important)
7. **CategorySelector & CategoryManager** - Navigation
8. **Scrollbars natives** - UX cohérente

### Phase 4 - Modals (Final)
9. **SettingsPanel** - Configuration complète
10. **ExportModal** - Fonctionnalités secondaires
11. **KeyboardShortcuts** - Aide utilisateur

## 🔧 Structure CSS Recommandée

### Organisation fichiers
```
src/
├── index.css (variables thématiques)
├── themes/
│   ├── dark.css (spécificités dark si nécessaire)
│   └── light.css (spécificités light si nécessaire)
```

### Variables CSS globales
```css
:root {
  /* Theme switching variables */
  --theme: 'dark'; /* default */
}

:root[data-theme="light"] {
  --theme: 'light';
  /* Override all theme variables */
}
```

## ✅ Checklist de Validation

### Pour chaque composant :
- [ ] Contraste texte ≥ 4.5:1
- [ ] États hover/focus visibles
- [ ] Bordures définies
- [ ] Ombres appropriées (light theme)
- [ ] Scrollbars adaptées
- [ ] Transitions fluides
- [ ] Cohérence avec design system

### Tests d'intégration :
- [ ] Switch theme sans reload
- [ ] Persistence préférence utilisateur
- [ ] Aucun "flash" lors du changement
- [ ] Fonctionnalité identique entre thèmes
- [ ] Performance maintenue

## 📱 Considérations Spéciales macOS

### Adaptation système
```css
/* Respect des préférences système */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* Auto light theme si pas de préférence utilisateur */
  }
}
```

### Glassmorphism natif
```css
/* Utiliser les APIs macOS si disponibles */
.native-blur-light {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
}
```