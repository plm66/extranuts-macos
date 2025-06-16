# Glassmorphism Values - Light & Dark Themes

## 🔮 Valeurs Dark Theme (Existantes)

### Backgrounds
```css
/* Valeurs actuelles dans index.css */
.glass-morphism {
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-glass {
  background: rgba(40, 40, 40, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Hover States Dark
```css
.hover-highlight {
  background: rgba(60, 60, 60, 0.9);
}
```

## ☀️ Valeurs Light Theme (Nouvelles)

### Backgrounds Light
```css
.glass-morphism-light {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.sidebar-glass-light {
  background: rgba(248, 249, 250, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
```

### Hover States Light
```css
.hover-highlight-light {
  background: rgba(233, 236, 239, 0.9);
  transition: background-color 150ms ease;
}
```

## 📐 Paramètres Blur et Opacité

### Dark Theme
| Élément | Background Alpha | Blur | Justification |
|---------|------------------|------|---------------|
| Main | 0.85 | 20px | Lisibilité sur fond sombre |
| Sidebar | 0.95 | 20px | Plus opaque pour hiérarchie |
| Hover | 0.90 | - | Feedback visuel clair |

### Light Theme  
| Élément | Background Alpha | Blur | Justification |
|---------|------------------|------|---------------|
| Main | 0.85 | 20px | Cohérence avec dark |
| Sidebar | 0.95 | 20px | Même hiérarchie visuelle |
| Hover | 0.90 | - | Feedback équivalent |

## 🎨 Ombres Portées

### Dark Theme (Subtiles)
```css
/* Ombres existantes minimales */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
```

### Light Theme (Plus Marquées)
```css
/* Ombres nécessaires pour définition sur fond clair */
.glass-shadow-light-soft {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.glass-shadow-light-medium {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.glass-shadow-light-strong {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
}
```

## 🔄 Transitions et Animations

### Cohérence Cross-Theme
```css
/* Même durée pour tous les thèmes */
.theme-transition {
  transition: 
    background-color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;
}
```

## 📱 Scrollbars Glassmorphism

### Dark Theme (Existant)
```css
.native-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.native-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
```

### Light Theme (Adapté)
```css
.native-scrollbar-light::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.native-scrollbar-light::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.35);
}
```

## 🎯 Guide d'Implémentation

### Structure CSS Recommandée
```css
/* Variables CSS pour faciliter le switch */
:root[data-theme="dark"] {
  --glass-bg: rgba(30, 30, 30, 0.85);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: rgba(0, 0, 0, 0.3);
}

:root[data-theme="light"] {
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(0, 0, 0, 0.1);
  --glass-shadow: rgba(0, 0, 0, 0.12);
}

.glass-morphism {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px var(--glass-shadow);
}
```

## ⚡ Performance Considerations

### Blur Optimizations
- Blur radius constant (20px) pour éviter recomputation
- Utiliser `will-change: backdrop-filter` sur éléments animés
- Éviter blur sur éléments scrollables en light theme (plus couteux)