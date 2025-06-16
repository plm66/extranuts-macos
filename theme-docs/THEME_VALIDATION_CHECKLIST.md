# Checklist de Validation - Système de Thèmes

## ✅ Phase 1 : Infrastructure CSS

### Variables CSS de Base
- [ ] Variables définies dans `:root` (thème clair par défaut)
- [ ] Variables override dans `[data-theme="dark"]`
- [ ] Variables de couleur principales :
  - [ ] `--theme-bg-primary` (fond principal)
  - [ ] `--theme-bg-secondary` (fond sidebar)
  - [ ] `--theme-bg-hover` (états hover)
  - [ ] `--theme-text-primary` (texte principal)
  - [ ] `--theme-text-secondary` (texte secondaire)
  - [ ] `--theme-border-primary` (bordures)
  - [ ] `--theme-accent-primary` (couleur d'accent)

### Variables CSS Avancées  
- [ ] Variables d'overlay :
  - [ ] `--theme-overlay-backdrop` (fond modal)
  - [ ] `--theme-overlay-medium` (overlays légers)
  - [ ] `--theme-overlay-strong` (overlays denses)
- [ ] Variables sémantiques :
  - [ ] `--theme-accent-blue` + variantes (sync)
  - [ ] `--theme-accent-purple` + variantes (apparence)
  - [ ] `--theme-accent-green` + variantes (éditeur)
  - [ ] `--theme-accent-yellow` + variantes (export)
  - [ ] `--theme-danger-primary` + hover
- [ ] Variables spécialisées :
  - [ ] `--theme-toolbar-bg` (barres d'outils)
  - [ ] `--theme-status-bg` (barre de statut)
  - [ ] `--theme-control-inactive` (contrôles inactifs)
  - [ ] `--theme-category-border` (bordures catégories)

### Classes Light Theme
- [ ] Classes `.theme-light` créées pour glassmorphism
- [ ] Classes `.theme-light` pour scrollbars natives
- [ ] Classes `.theme-light` pour styles markdown
- [ ] Classes `.theme-light` pour syntax highlighting
- [ ] Classes `.theme-light` pour wikilinks

## ✅ Phase 2 : ThemeStore et Intégration

### Store de Thème
- [ ] `themeStore.ts` intégré dans l'application
- [ ] Signal `theme()` accessible globalement
- [ ] Fonctions `isDark()` et `isLight()` fonctionnelles
- [ ] `toggleTheme()` change l'état du store
- [ ] Détection système pour mode `'auto'` active
- [ ] Listener sur `prefers-color-scheme` configuré

### Intégration DOM
- [ ] Attribut `data-theme` appliqué sur `<html>`
- [ ] Changement de thème met à jour `data-theme` en temps réel
- [ ] Variables CSS recalculées automatiquement
- [ ] Aucun re-render complet nécessaire pour changement

### Intégration Préférences
- [ ] Thème ajouté à la structure `Preferences`
- [ ] Sauvegarde automatique via Tauri lors du changement
- [ ] Restauration du thème au démarrage de l'app
- [ ] Fallback vers `'dark'` si préférences corrompues
- [ ] Migration des anciennes préférences sans thème

## ✅ Phase 3 : Toggle Fonctionnel

### Composant ThemeToggle
- [ ] Composant `ThemeToggle.tsx` créé
- [ ] Affiche le thème actuel avec icône appropriée
- [ ] Dropdown avec 3 options : Sombre / Clair / Auto
- [ ] Mode Auto indique le thème système détecté
- [ ] Styling cohérent avec le design de l'app

### Intégration Settings Panel
- [ ] ThemeToggle ajouté dans section "Apparence"
- [ ] Position appropriée dans l'interface settings
- [ ] Styling cohérent avec autres contrôles
- [ ] Pas de conflit avec transparency slider existant

## ✅ Phase 4 : Migration des Composants

### App.tsx (Priorité 1)
- [ ] `bg-macos-*` remplacé par variables CSS
- [ ] `text-macos-*` remplacé par variables CSS  
- [ ] `border-macos-*` remplacé par variables CSS
- [ ] `bg-black/*` overlays remplacés par variables
- [ ] Glass morphism utilise variables theme-aware
- [ ] Status bar utilise variables appropriées
- [ ] Modales et confirmations adaptées
- [ ] États hover et focus cohérents

### SettingsPanel.tsx (Priorité 2)
- [ ] Structure principale utilise variables CSS
- [ ] Sections colorées sémantiques (bleu, violet, vert, jaune)
- [ ] Toggle switches utilisent variables CSS
- [ ] Modal backdrop utilise variable appropriée
- [ ] Form controls cohérents avec le thème
- [ ] Hover states adaptés

### EnhancedEditor.tsx (Priorité 3)
- [ ] Texte éditeur utilise variables CSS
- [ ] Toolbar background adapté
- [ ] Boutons toolbar cohérents
- [ ] Bordures utilisent variables CSS
- [ ] Focus states visibles dans les deux thèmes

### CategorySelector.tsx (Priorité 3)  
- [ ] Dropdown background utilise variables CSS
- [ ] États hover adaptés
- [ ] Bordures catégories utilisent variables appropriées
- [ ] Textes secondaires cohérents
- [ ] Z-index et overlays maintenus

### MarkdownPreview.tsx (Priorité 4)
- [ ] `prose-invert` conditionnel selon thème
- [ ] WikiLinks CSS utilisent variables
- [ ] Headers markdown utilisent variables
- [ ] Links standards cohérents
- [ ] Code blocks styling préservé

## ✅ Phase 5 : Tests et Validation

### Tests Visuels
- [ ] Contraste WCAG AA respecté (texte principal ≥ 4.5:1)
- [ ] Contraste WCAG AA respecté (texte large ≥ 3:0:1)  
- [ ] Tous les boutons et liens accessibles
- [ ] Lisibilité maintenue dans markdown
- [ ] Syntax highlighting lisible
- [ ] WikiLinks bien contrastés

### Tests Fonctionnels
- [ ] Changement de thème instantané (< 16ms)
- [ ] Persistance entre sessions fonctionne
- [ ] Mode auto suit les changements système
- [ ] Aucun layout shift lors du changement
- [ ] Performance maintenue

### Tests de Régression
- [ ] Toutes les fonctionnalités existantes préservées
- [ ] Aucun crash lors des changements de thème
- [ ] Préférences autres que thème non affectées
- [ ] Export/import de notes fonctionnel
- [ ] Synchronisation non cassée

### Tests d'Accessibilité
- [ ] Navigation clavier préservée
- [ ] Screen readers fonctionnels
- [ ] Focus indicators visibles
- [ ] Couleurs non comme seul indicateur
- [ ] Respect des préférences système

## ✅ Phase 6 : Optimisation et Polish

### Performance
- [ ] Aucune régression de performance mesurée
- [ ] Bundle size impact minimal (< 2KB)
- [ ] Lazy loading des thèmes si applicable
- [ ] Memory usage stable

### UX et Polish
- [ ] Animations de changement fluides
- [ ] Feedback visuel approprié
- [ ] Cohérence visuelle maintenue
- [ ] Détails visuels (scrollbars, shadows) adaptés

### Documentation
- [ ] Guide utilisateur mis à jour
- [ ] Variables CSS documentées
- [ ] Patterns de développement documentés
- [ ] Exemples d'extension fournis

## 🔧 Outils de Validation

### Scripts de Test
```bash
# Test de contraste automatisé
npm run test:contrast

# Test de performance changement de thème  
npm run test:theme-performance

# Test d'accessibilité
npm run test:a11y

# Tests visuels (snapshots)
npm run test:visual
```

### Checklist de Développement
```typescript
// Validation automatique des variables CSS
const validateThemeVariables = () => {
  const requiredVars = [
    '--theme-bg-primary',
    '--theme-text-primary', 
    '--theme-border-primary'
    // ... autres variables
  ]
  
  requiredVars.forEach(varName => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
    console.assert(value.trim() !== '', `Variable ${varName} manquante`)
  })
}
```

### Validation Contraste
```typescript
// Validation WCAG AA automatique
const validateContrast = () => {
  const testCases = [
    { fg: '--theme-text-primary', bg: '--theme-bg-primary', min: 4.5 },
    { fg: '--theme-accent-primary', bg: '--theme-bg-primary', min: 4.5 }
    // ... autres cas
  ]
  
  testCases.forEach(testCase => {
    const contrast = calculateContrast(
      getCSSVariable(testCase.fg),
      getCSSVariable(testCase.bg)
    )
    console.assert(
      contrast >= testCase.min, 
      `Contraste insuffisant: ${contrast} < ${testCase.min}`
    )
  })
}
```

## 📊 Métriques de Succès

### Performance Targets
- **Changement de thème** : < 16ms (1 frame)
- **Memory overhead** : < 1KB par thème
- **Bundle size impact** : < 5KB total
- **Startup impact** : < 10ms additional

### Accessibilité Targets  
- **Contraste minimum** : WCAG AA (4.5:1 normal, 3:1 large)
- **Keyboard navigation** : 100% fonctionnel
- **Screen reader** : Compatibilité complète

### UX Targets
- **User feedback** : Changement instantané perçu
- **Visual consistency** : Aucune rupture dans l'expérience
- **Learning curve** : Interface intuitive

## ⚠️ Points de Vigilance

### Erreurs Communes à Éviter
- [ ] Ne pas oublier de tester le mode auto
- [ ] Vérifier tous les z-index après changements
- [ ] Tester avec du contenu réel (notes longues)
- [ ] Valider sur différentes tailles d'écran
- [ ] Tester les animations et transitions

### Rollback Plan
- [ ] Backup des versions de fichiers avant migration
- [ ] Feature flag pour désactiver le système si nécessaire
- [ ] Plan de rollback documenté
- [ ] Tests de régression avant release

## 🎯 Validation Finale

### Critères de Release
- [ ] **Tous** les items de ce checklist validés
- [ ] Tests automatisés passent à 100%
- [ ] Review de code complet effectué
- [ ] Test utilisateur final positif
- [ ] Performance benchmarks OK
- [ ] Documentation complète

### Sign-off
- [ ] **Product Owner** : UX et fonctionnalités validées
- [ ] **Tech Lead** : Architecture et performance validées
- [ ] **QA** : Tests et régression validés
- [ ] **Accessibility Expert** : Conformité WCAG validée

**Status Final** : [ ] PRÊT POUR PRODUCTION