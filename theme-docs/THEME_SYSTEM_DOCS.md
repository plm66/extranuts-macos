# Documentation du Système de Thèmes

## 🏗️ Architecture du Système

### Vue d'ensemble
Le système de thèmes d'Extranuts utilise une architecture en 3 couches :
- **Store de thème** (SolidJS Signal) → **Variables CSS** → **Interface utilisateur**
- **Persistance** via le système de préférences Tauri
- **Détection automatique** du thème système macOS

### Composants Principaux

#### 1. ThemeStore (`src/stores/themeStore.ts`)
```typescript
type Theme = 'dark' | 'light' | 'auto'

// État réactif avec SolidJS
const [theme, setTheme] = createSignal<Theme>('dark')
```

**Fonctionnalités :**
- `isDark()` : Détecte si le thème actuel est sombre
- `isLight()` : Détecte si le thème actuel est clair  
- `toggleTheme()` : Bascule entre dark/light
- Détection automatique du thème système

#### 2. Système de Variables CSS
Variables CSS dynamiques dans `:root` et `[data-theme]` :

```css
:root {
  /* Thème clair par défaut */
  --macos-bg: rgba(245, 245, 245, 0.85);
  --macos-text: rgba(0, 0, 0, 0.9);
}

[data-theme="dark"] {
  /* Override pour thème sombre */
  --macos-bg: rgba(30, 30, 30, 0.85);
  --macos-text: rgba(255, 255, 255, 0.9);
}
```

#### 3. Intégration Tailwind
Configuration personnalisée dans `tailwind.config.js` :
```javascript
colors: {
  'macos-bg': 'var(--macos-bg)',
  'macos-text': 'var(--macos-text)',
  // ... autres variables
}
```

### Flux de Données

```
Utilisateur/Système → ThemeStore → CSS Variables → Composants UI
                           ↓
                    Préférences Tauri
```

1. **Déclencheur** : Action utilisateur ou changement système
2. **Signal SolidJS** : Mise à jour réactive du thème
3. **DOM** : Application de `data-theme` sur `<html>`
4. **CSS** : Variables recalculées automatiquement
5. **Persistance** : Sauvegarde via Tauri

## 📘 Guide d'Utilisation

### Pour les Utilisateurs

#### Changer de Thème
1. Ouvrir les Préférences (⌘,)
2. Section "Apparence"
3. Sélectionner : Sombre / Clair / Auto

#### Mode Automatique
- **Auto** suit le thème système macOS
- Changement en temps réel sans redémarrage
- Respecte les préférences d'accessibilité

### Pour les Développeurs

#### Ajouter un Nouveau Thème

1. **Étendre le type Theme** :
```typescript
type Theme = 'dark' | 'light' | 'auto' | 'custom'
```

2. **Définir les variables CSS** :
```css
[data-theme="custom"] {
  --macos-bg: your-color;
  --macos-text: your-color;
  /* ... */
}
```

3. **Mettre à jour le ThemeStore** :
```typescript
const applyTheme = (theme: Theme) => {
  // Ajouter la logique pour 'custom'
}
```

#### Variables CSS Disponibles

**Couleurs de base :**
- `--macos-bg` : Arrière-plan principal (glassmorphism)
- `--macos-sidebar` : Arrière-plan sidebar
- `--macos-hover` : État hover des éléments

**Texte :**
- `--macos-text` : Texte principal
- `--macos-text-secondary` : Texte secondaire
- `--macos-text-muted` : Texte désactivé

**Interface :**
- `--macos-border` : Bordures subtiles
- `--macos-surface` : Surfaces élevées (cartes, modales)
- `--macos-accent` : Couleur d'accentuation

**Utilisation en Tailwind :**
```tsx
<div className="bg-macos-bg text-macos-text border-macos-border">
  Contenu avec thème automatique
</div>
```

#### Patterns Recommandés

**Composant sensible au thème :**
```tsx
const MyComponent = () => {
  const currentTheme = theme() // Signal réactif
  
  return (
    <div className={`
      bg-macos-bg 
      ${isDark() ? 'shadow-xl' : 'shadow-sm'}
    `}>
      {/* Contenu */}
    </div>
  )
}
```

**CSS personnalisé avec variables :**
```css
.custom-element {
  background: var(--macos-bg);
  color: var(--macos-text);
  border: 1px solid var(--macos-border);
}
```

## 🧠 Décisions Techniques

### Pourquoi Variables CSS vs Autres Approches

#### ✅ Avantages Variables CSS
- **Performance** : Pas de re-render complet des composants
- **Simplicité** : Un seul point de vérité pour les couleurs
- **Compatibilité** : Fonctionne avec Tailwind et CSS custom
- **Réactivité** : Changement instantané sur tout le DOM

#### ❌ Alternatives Écartées

**Tailwind `dark:` variant :**
- Nécessite duplication de toutes les classes
- Plus verbeux dans les templates
- Moins flexible pour thèmes personnalisés

**CSS-in-JS dynamique :**
- Overhead de performance en SolidJS
- Complexité de gestion d'état
- Bundle size plus important

### Stratégie de Fallback

#### Thème par Défaut
- **Fallback système** : Si échec détection → `dark`
- **Fallback préférences** : Si corruption → `auto`
- **CSS** : Variables définies dans `:root` comme fallback

#### Compatibilité Navigateur
```css
/* Fallback pour navigateurs sans support CSS variables */
.macos-bg-fallback {
  background-color: rgba(30, 30, 30, 0.85);
}

/* Modern avec variables */
.macos-bg {
  background-color: var(--macos-bg, rgba(30, 30, 30, 0.85));
}
```

### Considérations de Performance

#### Optimisations Implémentées
- **Signals SolidJS** : Reactivity fine-grained, pas de re-render global
- **CSS Variables natives** : Pas de JavaScript pour mise à jour
- **Lazy Loading** : Thèmes chargés uniquement si nécessaires

#### Métriques Cibles
- **Changement de thème** : < 16ms (1 frame)
- **Startup** : Thème appliqué avant first paint
- **Memory** : < 1KB overhead par thème

#### Surveillance
```typescript
// Monitoring des performances de changement de thème
const startTime = performance.now()
applyTheme(newTheme)
const endTime = performance.now()
console.log(`Theme switch: ${endTime - startTime}ms`)
```

### Architecture Extensible

#### Préparation Futurs Thèmes
- **Structure modulaire** : Un fichier CSS par thème
- **Variables sémantiques** : Pas liées aux couleurs spécifiques
- **API commune** : Interface constante pour nouveaux thèmes

#### Intégration Native macOS
- **Respect des préférences système** 
- **Support High Contrast Mode**
- **Adaptation Dynamic Desktop (futur)**

### Sécurité et Robustesse

#### Validation des Thèmes
```typescript
const validateTheme = (theme: unknown): theme is Theme => {
  return typeof theme === 'string' && 
         ['dark', 'light', 'auto'].includes(theme)
}
```

#### Gestion d'Erreurs
- **Graceful degradation** si thème corrompu
- **Logs d'erreur** sans crash de l'application
- **Recovery automatique** vers thème par défaut