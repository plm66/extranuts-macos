# Guide de Migration des Composants - Système de Thèmes

## 📋 Vue d'Ensemble

Ce guide détaille la migration de chaque composant majeur vers le nouveau système de thèmes. Les composants sont classés par priorité et chaque section fournit les changements précis à effectuer.

## 🚨 App.tsx
**Priorité : 1 (CRITIQUE)**

### Classes à Modifier

#### Couleurs de Fond
```typescript
// AVANT
className="bg-macos-bg"              // ligne 479
className="bg-macos-sidebar"         // ligne 121  
className="bg-black/90"              // ligne 728 (autocomplete)
className="bg-black/50"              // lignes 482, 892 (overlays)

// APRÈS
className="bg-[var(--theme-bg-primary)]"
className="bg-[var(--theme-bg-secondary)]"
className="bg-[var(--theme-overlay-strong)]"
className="bg-[var(--theme-overlay-medium)]"
```

#### Couleurs de Texte
```typescript
// AVANT
className="text-macos-text"          // lignes 40, 76, 485, 557, 595, 862, 868
className="text-macos-text-secondary" // lignes 558, 736, 750, 780, 801, 831, 846, 859, 879, 883, 895

// APRÈS
className="text-[var(--theme-text-primary)]"
className="text-[var(--theme-text-secondary)]"
```

#### Bordures et Hover
```typescript
// AVANT
className="border-macos-border"      // lignes 497, 760, 766, 825, 859, 893
className="bg-macos-hover"           // lignes 742, 774, 787

// APRÈS
className="border-[var(--theme-border-primary)]"
className="bg-[var(--theme-bg-hover)]"
```

### Couleurs Hardcodées à Corriger

#### Barre de Statut (ligne ~500)
```typescript
// AVANT
<div className="flex items-center gap-2 text-xs bg-macos-border/50 px-3 py-1">

// APRÈS
<div className="flex items-center gap-2 text-xs bg-[var(--theme-status-bg)] px-3 py-1">
```

#### Modal de Confirmation de Suppression
```typescript
// AVANT
<button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">

// APRÈS
<button className="bg-[var(--theme-danger-primary)] hover:bg-[var(--theme-danger-hover)] text-white px-4 py-2 rounded">
```

### Points d'Attention
- **Glassmorphism** : Les effets `glass-morphism` et `sidebar-glass` doivent utiliser les variables CSS
- **Z-index** : Maintenir la hiérarchie des modales et overlays
- **Animations** : Vérifier que les transitions restent fluides

### Ordre de Priorité des Modifications
1. **Layout principal** (fond, sidebar) - Impact visuel majeur
2. **Modales et overlays** - Visibilité critique  
3. **États hover et focus** - UX
4. **Textes et bordures** - Lisibilité
5. **Détails (status bar, etc.)** - Polish

---

## ⚙️ SettingsPanel.tsx  
**Priorité : 2 (HAUTE)**

### Classes à Modifier

#### Structure Principale
```typescript
// AVANT
className="bg-macos-bg border-macos-border"  // ligne 103

// APRÈS
className="bg-[var(--theme-bg-primary)] border-[var(--theme-border-primary)]"
```

#### Panneaux Latéraux
```typescript
// AVANT
className="bg-macos-sidebar/50 border-macos-border" // lignes 121, 683

// APRÈS
className="bg-[var(--theme-bg-secondary)] border-[var(--theme-border-primary)]"
```

#### Sections Colorées
```typescript
// AVANT
className="bg-blue-500/10 border-blue-500/20"      // Section Sync
className="bg-purple-500/10 border-purple-500/20"  // Section Apparence
className="bg-green-500/10 border-green-500/20"    // Section Éditeur
className="bg-yellow-500/10 border-yellow-500/20"  // Section Export

// APRÈS
className="bg-[var(--theme-accent-blue-bg)] border-[var(--theme-accent-blue-border)]"
className="bg-[var(--theme-accent-purple-bg)] border-[var(--theme-accent-purple-border)]"
className="bg-[var(--theme-accent-green-bg)] border-[var(--theme-accent-green-border)]"
className="bg-[var(--theme-accent-yellow-bg)] border-[var(--theme-accent-yellow-border)]"
```

### Couleurs Hardcodées à Corriger

#### Toggle Switches
```typescript
// AVANT
const toggleClass = enabled 
  ? "bg-blue-600" 
  : "bg-gray-600"

// APRÈS  
const toggleClass = enabled 
  ? "bg-[var(--theme-accent-blue)]" 
  : "bg-[var(--theme-control-inactive)]"
```

#### Overlay Modal
```typescript
// AVANT
<div className="fixed inset-0 bg-black/50 z-50">

// APRÈS
<div className="fixed inset-0 bg-[var(--theme-overlay-backdrop)] z-50">
```

### Points d'Attention
- **Sections sémantiques** : Préserver la signification des couleurs (bleu=sync, violet=apparence, etc.)
- **Contrôles de formulaire** : Boutons, sliders, toggles cohérents
- **Accessibilité** : Contraste maintenu sur tous les éléments interactifs

### Ordre de Priorité des Modifications
1. **Modal backdrop et structure** - Visibilité
2. **Sections colorées** - Identité visuelle
3. **Contrôles interactifs** - UX critique  
4. **Textes et labels** - Lisibilité
5. **Bordures et séparateurs** - Polish

---

## ✏️ EnhancedEditor.tsx
**Priorité : 3 (MOYENNE)**

### Classes à Modifier

#### Zone d'Édition
```typescript
// AVANT
className="text-macos-text"          // ligne 100

// APRÈS
className="text-[var(--theme-text-primary)]"
```

#### Barre d'Outils Verticale
```typescript
// AVANT
className="border-macos-border bg-black/20"  // ligne 109

// APRÈS
className="border-[var(--theme-border-primary)] bg-[var(--theme-toolbar-bg)]"
```

### Couleurs Hardcodées à Corriger

#### Boutons de la Barre d'Outils
```typescript
// AVANT
<button className="hover-highlight p-2 rounded">

// APRÈS - Mise à jour dans CSS
.toolbar-button {
  @apply hover:bg-[var(--theme-bg-hover)] p-2 rounded;
}
```

### Points d'Attention
- **Lisibilité du texte** : Contraste avec le fond d'édition
- **Toolbar compacte** : Espace réduit, couleurs doivent rester discrètes
- **Focus indicators** : États de focus visibles dans les deux thèmes

### Ordre de Priorité des Modifications
1. **Texte de l'éditeur** - Lisibilité critique
2. **Toolbar background** - Cohérence visuelle
3. **Boutons toolbar** - UX
4. **Bordures et séparateurs** - Polish

---

## 📁 CategorySelector.tsx
**Priorité : 3 (MOYENNE)**

### Classes à Modifier

#### Dropdown Principal
```typescript
// AVANT
className="bg-macos-bg border-macos-border"  // ligne 115

// APRÈS
className="bg-[var(--theme-bg-primary)] border-[var(--theme-border-primary)]"
```

#### États Hover
```typescript
// AVANT
className="bg-macos-hover"           // lignes 60, 118, 144

// APRÈS
className="bg-[var(--theme-bg-hover)]"
```

#### Textes Secondaires
```typescript
// AVANT
className="text-macos-text-secondary" // lignes 69, 98, 122, 134

// APRÈS
className="text-[var(--theme-text-secondary)]"
```

### Couleurs Hardcodées à Corriger

#### Indicateurs de Couleur de Catégories
```typescript
// AVANT
<div 
  className="w-3 h-3 rounded-full border-2 border-white/20"
  style={{ backgroundColor: category.color }}
>

// APRÈS
<div 
  className="w-3 h-3 rounded-full border-2 border-[var(--theme-category-border)]"
  style={{ backgroundColor: category.color }}
>
```

### Points d'Attention
- **Couleurs de catégories** : Préserver les couleurs personnalisées tout en adaptant les bordures
- **Dropdown z-index** : Maintenir au-dessus des autres éléments
- **Hiérarchie visuelle** : Indentation et niveaux de catégories

### Ordre de Priorité des Modifications
1. **Dropdown background** - Visibilité critique
2. **États hover** - UX
3. **Bordures catégories** - Cohérence
4. **Textes secondaires** - Lisibilité

---

## 📄 MarkdownPreview.tsx
**Priorité : 4 (BASSE)**

### Classes à Modifier

#### Prose Typography
```typescript
// AVANT
className="prose prose-invert"      // ligne 108

// APRÈS
className={`prose ${isDark() ? 'prose-invert' : 'prose-slate'}`}
```

### CSS Global à Modifier (index.css)

#### WikiLinks
```css
/* AVANT */
.wikilink-exists {
  color: #007AFF;
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.2);
}

/* APRÈS */
.wikilink-exists {
  color: var(--theme-accent-primary);
  background: var(--theme-accent-bg);
  border-color: var(--theme-accent-border);
}
```

#### Headings Markdown
```css
/* AVANT */
.markdown-h1, .markdown-h2, .markdown-h3 {
  color: rgba(255, 255, 255, 0.9);
}

/* APRÈS */
.markdown-h1, .markdown-h2, .markdown-h3 {
  color: var(--theme-text-primary);
}
```

### Points d'Attention
- **Typography cohérency** : Maintenir la hiérarchie des titres
- **Links colors** : WikiLinks et liens standards cohérents
- **Code blocks** : Gérés par CodeBlock.tsx séparément

### Ordre de Priorité des Modifications
1. **Prose base class** - Changement conditionnel
2. **WikiLinks styling** - Important pour navigation
3. **Headers colors** - Hiérachie visuelle
4. **Links standards** - Cohérence

---

## 🎨 Variables CSS Nécessaires

### Nouvelles Variables à Ajouter dans themes.css

```css
:root {
  /* Status & Overlays */
  --theme-status-bg: rgba(245, 245, 245, 0.8);
  --theme-overlay-backdrop: rgba(0, 0, 0, 0.3);
  --theme-overlay-medium: rgba(0, 0, 0, 0.2);
  --theme-overlay-strong: rgba(0, 0, 0, 0.4);
  
  /* Toolbar */
  --theme-toolbar-bg: rgba(0, 0, 0, 0.05);
  
  /* Controls */
  --theme-control-inactive: #d1d5db;
  
  /* Category borders */
  --theme-category-border: rgba(0, 0, 0, 0.1);
  
  /* Semantic Accents */
  --theme-accent-blue: #007AFF;
  --theme-accent-blue-bg: rgba(0, 122, 255, 0.1);
  --theme-accent-blue-border: rgba(0, 122, 255, 0.2);
  
  --theme-accent-purple-bg: rgba(147, 51, 234, 0.1);
  --theme-accent-purple-border: rgba(147, 51, 234, 0.2);
  
  --theme-accent-green-bg: rgba(34, 197, 94, 0.1);
  --theme-accent-green-border: rgba(34, 197, 94, 0.2);
  
  --theme-accent-yellow-bg: rgba(251, 191, 36, 0.1);
  --theme-accent-yellow-border: rgba(251, 191, 36, 0.2);
  
  /* Danger States */
  --theme-danger-primary: #dc2626;
  --theme-danger-hover: #b91c1c;
}

[data-theme="dark"] {
  /* Status & Overlays */
  --theme-status-bg: rgba(60, 60, 60, 0.8);
  --theme-overlay-backdrop: rgba(0, 0, 0, 0.5);
  --theme-overlay-medium: rgba(0, 0, 0, 0.5);
  --theme-overlay-strong: rgba(0, 0, 0, 0.9);
  
  /* Toolbar */
  --theme-toolbar-bg: rgba(0, 0, 0, 0.2);
  
  /* Controls */
  --theme-control-inactive: #6b7280;
  
  /* Category borders */
  --theme-category-border: rgba(255, 255, 255, 0.2);
  
  /* Semantic Accents - ajustés pour dark theme */
  --theme-accent-blue: #0A84FF;
  --theme-accent-blue-bg: rgba(10, 132, 255, 0.15);
  --theme-accent-blue-border: rgba(10, 132, 255, 0.3);
  
  /* Danger States */
  --theme-danger-primary: #ff453a;
  --theme-danger-hover: #ff6961;
}
```

## 📝 Checklist de Migration par Composant

### App.tsx
- [ ] Backgrounds principaux (bg-macos-*)
- [ ] Overlays et modales (bg-black/*)
- [ ] Textes (text-macos-*)
- [ ] Bordures (border-macos-*)
- [ ] États hover (bg-macos-hover)
- [ ] Status bar styling
- [ ] Glass morphism classes

### SettingsPanel.tsx
- [ ] Modal backdrop
- [ ] Panel backgrounds
- [ ] Sections colorées sémantiques
- [ ] Toggle switches
- [ ] Form controls
- [ ] Hover states

### EnhancedEditor.tsx
- [ ] Editor text color
- [ ] Toolbar background
- [ ] Button hover states
- [ ] Border styling

### CategorySelector.tsx
- [ ] Dropdown background
- [ ] Hover states
- [ ] Category color borders
- [ ] Secondary texts

### MarkdownPreview.tsx
- [ ] Prose class conditionnelle
- [ ] WikiLinks CSS
- [ ] Markdown headers CSS
- [ ] Standard links CSS

## 🚀 Ordre de Migration Recommandé

1. **Phase 1** : CSS Variables setup + App.tsx layout
2. **Phase 2** : SettingsPanel.tsx modal system  
3. **Phase 3** : EnhancedEditor.tsx + CategorySelector.tsx
4. **Phase 4** : MarkdownPreview.tsx CSS global
5. **Phase 5** : Polish et optimisations