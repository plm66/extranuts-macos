# Brief Agent Documentation - Documentation & Tests

## 🎯 Votre Mission
Documenter le système de thèmes et préparer la structure des tests, SANS écrire de code.

## 📋 Tâches à Réaliser

### 1. Documentation Technique
Créer `THEME_SYSTEM_DOCS.md` :

**Architecture du système :**
- Comment fonctionne le themeStore
- Flux de données (signal → CSS → UI)
- Points d'intégration avec l'app

**Guide d'utilisation :**
- Comment changer de thème (user)
- Comment ajouter un nouveau thème (dev)
- Variables CSS disponibles

**Décisions techniques :**
- Pourquoi variables CSS vs autres approches
- Stratégie de fallback
- Performance considerations

### 2. Plan de Tests
Créer `THEME_TESTS_PLAN.md` :

**Tests unitaires à implémenter :**
- themeStore : toggle, persistence, auto-detection
- ThemeToggle : interaction, état visuel
- Préférences : sauvegarde/chargement

**Tests d'intégration :**
- Changement de thème global
- Persistance entre sessions
- Détection système auto

**Tests visuels :**
- Contraste suffisant (WCAG AA)
- Lisibilité sur tous les composants
- Cohérence visuelle

### 3. Guide de Migration
Créer `COMPONENT_MIGRATION_GUIDE.md` :

Pour chaque composant majeur :
- App.tsx
- EnhancedEditor.tsx
- MarkdownPreview.tsx
- CategorySelector.tsx
- SettingsPanel.tsx

Format par composant :
```
## ComponentName
- Classes à modifier : [liste]
- Couleurs hardcodées : [liste avec ligne]
- Points d'attention : [spécificités]
- Ordre de priorité : [1-5]
```

### 4. Checklist de Validation
Créer `THEME_VALIDATION_CHECKLIST.md` :
- [ ] Variables CSS définies
- [ ] Classes light créées
- [ ] Toggle fonctionnel
- [ ] Persistance OK
- [ ] Tous composants adaptés
- [ ] Tests passent
- [ ] Documentation complète

### 5. FAQ Anticipée
Documenter les questions probables :
- Pourquoi pas Tailwind dark: variant ?
- Comment gérer les images/icônes ?
- Impact sur les performances ?
- Compatibilité avec futurs thèmes ?

## 💬 Communication
- Quand prêt : "[DOC] [nom] complété"
- Questions : "CLARIFICATION: [sujet]"
- Status : "DOCS STATUS: X/5 complétés"

## 📍 Où Sauvegarder
Créer un dossier `theme-docs/` et y placer tous les documents.

Confirmez avec "DOCS READY" quand vous êtes prêt.