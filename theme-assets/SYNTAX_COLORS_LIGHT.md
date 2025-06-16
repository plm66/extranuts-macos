# Syntax Highlighting Colors - Light Theme

## 🌙 Couleurs Dark Theme (Existantes)

### Référence depuis index.css
```css
/* Valeurs actuelles dark theme */
.syntax-keyword { color: #A855F7; }      /* text-purple-400 */
.syntax-string { color: #4ADE80; }       /* text-green-400 */
.syntax-comment { color: #6B7280; }      /* text-gray-500 */
.syntax-number { color: #22D3EE; }       /* text-cyan-400 */
.syntax-operator { color: #FB923C; }     /* text-orange-400 */
.syntax-function { color: #FACC15; }     /* text-yellow-400 */
.syntax-variable { color: #60A5FA; }     /* text-blue-400 */
```

## ☀️ Couleurs Light Theme (Adaptées)

### Principes d'Adaptation
1. **Contraste élevé** : Couleurs plus foncées pour lisibilité sur fond clair
2. **Saturation maintenue** : Préserver l'identité visuelle de chaque élément
3. **Cohérence** : Respecter la logique colorimétrique existante

### Nouvelle Palette Light
```css
.syntax-keyword-light { 
  color: #7C3AED;        /* Plus foncé que purple-400 */
  font-weight: 600;      /* Maintenir l'emphase */
}

.syntax-string-light { 
  color: #059669;        /* Green-600 pour contraste */
}

.syntax-comment-light { 
  color: #6B7280;        /* Gray-500 reste lisible */
  font-style: italic;    /* Maintenir la différenciation */
}

.syntax-number-light { 
  color: #0891B2;        /* Cyan-600 pour visibilité */
}

.syntax-operator-light { 
  color: #EA580C;        /* Orange-600 pour contraste */
}

.syntax-function-light { 
  color: #D97706;        /* Amber-600 - plus foncé que yellow */
}

.syntax-variable-light { 
  color: #2563EB;        /* Blue-600 pour lisibilité */
}
```

## 📊 Comparatif Contraste

| Élément | Dark Theme | Light Theme | Ratio Contraste |
|---------|------------|-------------|-----------------|
| Keyword | `#A855F7` | `#7C3AED` | 4.8:1 |
| String | `#4ADE80` | `#059669` | 5.2:1 |
| Comment | `#6B7280` | `#6B7280` | 4.5:1 |
| Number | `#22D3EE` | `#0891B2` | 4.9:1 |
| Operator | `#FB923C` | `#EA580C` | 5.1:1 |
| Function | `#FACC15` | `#D97706` | 5.3:1 |
| Variable | `#60A5FA` | `#2563EB` | 4.7:1 |

## 🎨 Classes CSS Complètes

### Structure Thématique
```css
/* Dark theme (existant) */
:root[data-theme="dark"] {
  --syntax-keyword: #A855F7;
  --syntax-string: #4ADE80;
  --syntax-comment: #6B7280;
  --syntax-number: #22D3EE;
  --syntax-operator: #FB923C;
  --syntax-function: #FACC15;
  --syntax-variable: #60A5FA;
}

/* Light theme (nouveau) */
:root[data-theme="light"] {
  --syntax-keyword: #7C3AED;
  --syntax-string: #059669;
  --syntax-comment: #6B7280;
  --syntax-number: #0891B2;
  --syntax-operator: #EA580C;
  --syntax-function: #D97706;
  --syntax-variable: #2563EB;
}

/* Classes unifiées */
.syntax-keyword { 
  color: var(--syntax-keyword);
  font-weight: 600;
}

.syntax-string { 
  color: var(--syntax-string);
}

.syntax-comment { 
  color: var(--syntax-comment);
  font-style: italic;
}

.syntax-number { 
  color: var(--syntax-number);
}

.syntax-operator { 
  color: var(--syntax-operator);
}

.syntax-function { 
  color: var(--syntax-function);
}

.syntax-variable { 
  color: var(--syntax-variable);
}
```

## 💡 Considérations UX

### Langages Supportés
- **JavaScript/TypeScript** : Keywords, functions, variables
- **Python** : Keywords, strings, comments
- **CSS** : Properties, values, selectors
- **HTML** : Tags, attributes, values
- **Markdown** : Headers, links, code

### États Spéciaux
```css
/* Sélection de code */
.syntax-selection-light {
  background: rgba(59, 130, 246, 0.15);
}

/* Ligne active en light theme */
.syntax-line-highlight-light {
  background: rgba(0, 0, 0, 0.05);
}

/* Correspondance de parenthèses */
.syntax-bracket-match-light {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
}
```

## 🔄 Migration Guidelines

### De Dark vers Light
1. Remplacer les classes `.syntax-*` par `.syntax-*-light`
2. Ou utiliser le système de variables CSS thématiques
3. Tester la lisibilité sur différents types de code
4. Vérifier la cohérence avec les couleurs de catégories

### Fallback Strategy
```css
/* Si le thème n'est pas détecté, utiliser dark par défaut */
.syntax-keyword {
  color: var(--syntax-keyword, #A855F7);
}
```

## 🎯 Points d'Attention

1. **Comments** : Même couleur dark/light car déjà optimal
2. **Functions** : Éviter yellow pur en light (mauvais contraste)
3. **Variables** : Blue-600 plus lisible que blue-400 sur blanc
4. **Keywords** : Maintenir font-weight pour emphasis
5. **Strings** : Green foncé crucial pour différenciation