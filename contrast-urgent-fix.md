# 🚨 CONTRAST URGENT FIX - PROBLÈMES CRITIQUES DÉTECTÉS

## ❌ CRITIQUES - À FIXER IMMÉDIATEMENT

### 1. CLASSE HARDCODÉE `text-white` (Invisible en light mode)
```tsx
// PROBLÈME : Ces boutons utilisent text-white hardcodé
src/components/ExportModal.tsx:
- "bg-blue-600 hover:bg-blue-700 text-white" 
- "bg-purple-600 hover:bg-purple-700 text-white"

src/components/CategoryManager.tsx:
- "bg-blue-600 hover:bg-blue-700 text-white"

src/components/SettingsPanel.tsx:
- "bg-blue-600 hover:bg-blue-700 text-white"
```

### 2. MAPPING INCORRECT des classes Tailwind
```css
/* PROBLÈME MAJEUR dans src/index.css */
.theme-light {
    @apply bg-gray-900 text-macos-text; // ← bg-gray-900 en LIGHT mode !
}

/* Classes markdown hardcodées en blanc */
h1, h2, h3, h4, h5, h6 {
    @apply text-macos-text; // ← text-macos-text reste blanc en light
}
```

### 3. VARIABLES CSS mal configurées
```css
/* Ces variables sont BONNES dans themes.css */
.theme-light {
    --theme-text-primary: rgba(28, 28, 30, 0.9); ✅ NOIR
    --theme-text-secondary: rgba(28, 28, 30, 0.6); ✅ GRIS FONCÉ
}

/* MAIS les classes Tailwind ne les utilisent PAS */
```

## ⚠️ DANGEREUX - Contraste insuffisant

### Classes `text-macos-text-secondary` avec opacité 0.6
- Risque de contraste < 3:1 sur fonds clairs
- Utilisé massivement dans tous les composants

## ✅ SOLUTIONS IMMÉDIATES

### FIX 1: Remplacer text-white hardcodé
```tsx
// AVANT
class="bg-blue-600 hover:bg-blue-700 text-white"

// APRÈS
class="bg-blue-600 hover:bg-blue-700 text-white dark:text-white text-white"
// OU mieux :
class="bg-blue-600 hover:bg-blue-700 text-white"
```

### FIX 2: Corriger les classes Tailwind dans index.css
```css
/* AVANT */
.theme-light {
    @apply bg-gray-900 text-macos-text;
}

/* APRÈS */
.theme-light {
    @apply bg-gray-50 text-gray-900;
}

/* OU utiliser les variables CSS */
.theme-light {
    background-color: var(--theme-bg-primary);
    color: var(--theme-text-primary);
}
```

### FIX 3: Mapping correct text-macos-text
```css
/* Ajouter dans index.css */
.theme-light .text-macos-text {
    color: var(--theme-text-primary) !important;
}

.theme-light .text-macos-text-secondary {
    color: var(--theme-text-secondary) !important;
}
```

## 🎯 ORDRE DE PRIORITÉ

1. **IMMÉDIAT** : Fixer .theme-light bg-gray-900 → bg-gray-50
2. **URGENT** : Mapper text-macos-text vers variables CSS
3. **CRITIQUE** : Vérifier tous les text-white sur boutons colorés
4. **IMPORTANT** : Tester contraste text-macos-text-secondary

## 🧪 TESTS À FAIRE

```bash
# Vérifier le rendu en light mode
npm run tauri:dev
# Tester tous les composants avec boutons
# Vérifier lisibilité du texte secondaire
```