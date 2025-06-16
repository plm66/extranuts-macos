# Theme Colors - Palettes Light & Dark

## 🎨 Couleurs de Base Light Theme

### Background et Structure
```css
/* Fond principal light avec glassmorphism */
--light-bg-primary: rgba(255, 255, 255, 0.85);
--light-sidebar: rgba(248, 249, 250, 0.95);
--light-hover: rgba(233, 236, 239, 0.9);

/* Bordures et séparateurs */
--light-border: rgba(0, 0, 0, 0.1);
--light-border-strong: rgba(0, 0, 0, 0.15);
```

### Texte et Contenu
```css
/* Texte principal - contraste élevé */
--light-text-primary: rgba(33, 37, 41, 0.95);
--light-text-secondary: rgba(73, 80, 87, 0.75);
--light-text-tertiary: rgba(108, 117, 125, 0.65);

/* Texte désactivé */
--light-text-disabled: rgba(173, 181, 189, 0.5);
```

## 🔄 Adaptation Couleurs Catégories pour Light Theme

### Projects - Violet (#8B5CF6)
```css
/* Dark theme (existant) */
--projects-dark: #8B5CF6;
--projects-dark-glass: rgba(139, 92, 246, 0.15);
--projects-dark-border: rgba(139, 92, 246, 0.3);
--projects-dark-text: #C4B5FD;

/* Light theme adaptation */
--projects-light: #7C3AED;        /* Plus saturé pour fond clair */
--projects-light-glass: rgba(124, 58, 237, 0.12);
--projects-light-border: rgba(124, 58, 237, 0.25);
--projects-light-text: #5B21B6;   /* Plus foncé pour contraste */
```

### Ideas - Rose (#EC4899)
```css
/* Dark theme (existant) */
--ideas-dark: #EC4899;
--ideas-dark-glass: rgba(236, 72, 153, 0.15);
--ideas-dark-border: rgba(236, 72, 153, 0.3);
--ideas-dark-text: #F9A8D4;

/* Light theme adaptation */
--ideas-light: #DB2777;
--ideas-light-glass: rgba(219, 39, 119, 0.12);
--ideas-light-border: rgba(219, 39, 119, 0.25);
--ideas-light-text: #BE185D;
```

### Research - Cyan (#06B6D4)
```css
/* Dark theme (existant) */
--research-dark: #06B6D4;
--research-dark-glass: rgba(6, 182, 212, 0.15);
--research-dark-border: rgba(6, 182, 212, 0.3);
--research-dark-text: #67E8F9;

/* Light theme adaptation */
--research-light: #0891B2;
--research-light-glass: rgba(8, 145, 178, 0.12);
--research-light-border: rgba(8, 145, 178, 0.25);
--research-light-text: #0E7490;
```

### Important - Rouge (#EF4444)
```css
/* Dark theme (existant) */
--important-dark: #EF4444;
--important-dark-glass: rgba(239, 68, 68, 0.15);
--important-dark-border: rgba(239, 68, 68, 0.3);
--important-dark-text: #FCA5A5;

/* Light theme adaptation */
--important-light: #DC2626;
--important-light-glass: rgba(220, 38, 38, 0.12);
--important-light-border: rgba(220, 38, 38, 0.25);
--important-light-text: #B91C1C;
```

### Draft - Orange (#F97316)
```css
/* Dark theme (existant) */
--draft-dark: #F97316;
--draft-dark-glass: rgba(249, 115, 22, 0.15);
--draft-dark-border: rgba(249, 115, 22, 0.3);
--draft-dark-text: #FDBA74;

/* Light theme adaptation */
--draft-light: #EA580C;
--draft-light-glass: rgba(234, 88, 12, 0.12);
--draft-light-border: rgba(234, 88, 12, 0.25);
--draft-light-text: #C2410C;
```

### Archive - Gris (#6B7280)
```css
/* Dark theme (existant) */
--archive-dark: #6B7280;
--archive-dark-glass: rgba(107, 114, 128, 0.15);
--archive-dark-border: rgba(107, 114, 128, 0.3);
--archive-dark-text: #9CA3AF;

/* Light theme adaptation */
--archive-light: #4B5563;
--archive-light-glass: rgba(75, 85, 99, 0.12);
--archive-light-border: rgba(75, 85, 99, 0.25);
--archive-light-text: #374151;
```

## 📝 États Interactifs Light Theme

### Hover States
```css
--light-hover-soft: rgba(0, 0, 0, 0.05);
--light-hover-medium: rgba(0, 0, 0, 0.08);
--light-hover-strong: rgba(0, 0, 0, 0.12);
```

### Focus States
```css
--light-focus-ring: rgba(59, 130, 246, 0.5);
--light-focus-border: #3B82F6;
```

### Selection States
```css
--light-selection-bg: rgba(59, 130, 246, 0.15);
--light-selection-border: rgba(59, 130, 246, 0.3);
```

## 🎭 Comparatif Dark vs Light

| Élément | Dark Theme | Light Theme | Remarque |
|---------|------------|-------------|----------|
| Background | `rgba(30, 30, 30, 0.85)` | `rgba(255, 255, 255, 0.85)` | Même opacité glassmorphism |
| Texte principal | `rgba(255, 255, 255, 0.9)` | `rgba(33, 37, 41, 0.95)` | Contraste inversé |
| Bordures | `rgba(255, 255, 255, 0.1)` | `rgba(0, 0, 0, 0.1)` | Même opacité, couleur inversée |
| Hover | `rgba(60, 60, 60, 0.9)` | `rgba(233, 236, 239, 0.9)` | Cohérence visuelle |

## 💡 Principes de Conception Light Theme

1. **Contraste** : Texte foncé sur fond clair (inverse du dark)
2. **Saturation** : Couleurs plus saturées pour ressortir sur fond clair
3. **Opacité** : Réduction légère pour éviter la saturation visuelle
4. **Cohérence** : Même logique de glassmorphism que dark theme
5. **Accessibilité** : Ratios de contraste WCAG AA minimum (4.5:1)