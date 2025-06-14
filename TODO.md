# Extranuts macOS - TODO List

> 📖 **Ce document fait partie du système documentaire décrit dans [CLAUDE.md](CLAUDE.md)**  
> ⚠️ **À SYNCHRONISER** : Après chaque tâche complétée, la déplacer vers [WORK_COMPLETED.md](WORK_COMPLETED.md)

## 🚀 Priorité Haute

### 1. Installation et Setup Initial
- [ ] Naviguer vers le dossier et installer les dépendances (`cd ../extranuts-macos && npm install`)
- [ ] Générer les icônes macOS appropriées (.icns format)
- [ ] Tester le lancement de l'application (`npm run tauri:dev`)
- [ ] Vérifier que le system tray fonctionne correctement

### 2. Modèles de Données
- [ ] Définir les types TypeScript pour Note, Category, Tag
- [ ] Implémenter le système de stockage (SQLite via Tauri ou système de fichiers)
- [ ] Créer les stores SolidJS pour la gestion d'état
- [ ] Implémenter la persistence des données

### 3. Menu Contextuel System Tray
- [ ] Créer le menu avec options (Show/Hide, New Note, Preferences, Quit)
- [ ] Implémenter les raccourcis clavier globaux
- [ ] Ajouter l'indicateur de nombre de notes
- [ ] Support du dark/light mode automatique

## 📝 Priorité Moyenne

### 4. Fonctionnalités Notes
- [ ] Éditeur de notes avec markdown support
- [ ] Système de recherche en temps réel
- [ ] Tags et catégories avec filtrage
- [ ] Pin/unpin des notes importantes
- [ ] Export des notes (Markdown, PDF, HTML)

### 5. Fenêtres Flottantes Avancées
- [ ] Redimensionnement et repositionnement persistant
- [ ] Mini-mode pour notes compactes
- [ ] Transparence ajustable
- [ ] Ancrage aux bords de l'écran
- [ ] Multi-monitor support

### 6. Interface Utilisateur
- [ ] Intégrer Ark UI ou Kobalte pour les composants
- [ ] Créer les composants réutilisables (Button, Input, Select, etc.)
- [ ] Implémenter les animations avec Motionone
- [ ] Créer les vues (NoteList, NoteEditor, Settings)
- [ ] Support des thèmes personnalisables

### 7. Synchronisation et Backup
- [ ] Backup automatique local
- [ ] Import/export de données
- [ ] Sync iCloud (optionnel)
- [ ] Historique des versions

## 🔧 Priorité Basse

### 8. Préférences et Configuration
- [ ] Interface de préférences
- [ ] Raccourcis clavier personnalisables
- [ ] Choix de police et taille
- [ ] Configuration des fenêtres flottantes par défaut

### 9. Intégrations macOS
- [ ] Quick Look pour preview des notes
- [ ] Services macOS (sélection de texte → nouvelle note)
- [ ] Spotlight search integration
- [ ] Share extension
- [ ] Touch Bar support (si applicable)

### 10. Performance et Polish
- [ ] Optimisation du démarrage
- [ ] Lazy loading des composants
- [ ] Virtual scrolling pour grandes listes
- [ ] Tests unitaires et d'intégration
- [ ] Documentation utilisateur

## 🐛 Bugs Connus / Améliorations

### Corrections Nécessaires
- [ ] L'icône PNG temporaire doit être remplacée par un vrai icône
- [ ] Gérer proprement les erreurs Tauri
- [ ] Améliorer le feedback visuel des actions

### Améliorations UX
- [ ] Ajouter des tooltips
- [ ] Feedback sonore pour certaines actions
- [ ] Animations de transition entre vues
- [ ] Onboarding pour nouveaux utilisateurs

## 📦 Distribution

### Préparation Release
- [ ] Signing et notarization pour macOS
- [ ] Auto-updater configuration
- [ ] Site web / landing page
- [ ] App Store submission (optionnel)

## 🔮 Fonctionnalités Futures

### V2.0 Ideas
- [ ] AI integration pour suggestions
- [ ] Collaboration temps réel
- [ ] Dessin et annotations
- [ ] Voice notes
- [ ] Templates de notes
- [ ] Plugins system

## 📚 Documentation Nécessaire

- [ ] README avec instructions d'installation
- [ ] Guide de contribution
- [ ] Architecture documentation
- [ ] API documentation pour plugins futurs