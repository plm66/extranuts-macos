# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ LECTURE OBLIGATOIRE DES DOCUMENTS

**AVANT TOUTE ACTION, vous DEVEZ lire dans cet ordre :**

1. **[Documentation/RAPPORT_SUCCESSEUR_2025-01-17.md](Documentation/RAPPORT_SUCCESSEUR_2025-01-17.md)** - 🚨 NOUVEAU - Rapport de passation avec état critique et 7 bugs à corriger
2. **[Documentation/Handover_phase_2.md](Documentation/Handover_phase_2.md)** - État détaillé du projet avec bugs critiques documentés
3. **[Documentation/sécurité/SYNTHESE_UNIFIED_DEFENSE_STRATEGY.md](Documentation/sécurité/SYNTHESE_UNIFIED_DEFENSE_STRATEGY.md)** - Architecture cible pour éviter les régressions
4. **[PRD.md](PRD.md)** - Vision produit et décisions verrouillées
5. **[WORK_COMPLETED.md](WORK_COMPLETED.md)** - Travail déjà réalisé (NE PAS REFAIRE)
6. **[TODO.md](TODO.md)** - Prochaines tâches à effectuer
7. **[README.md](README.md)** - Vue d'ensemble du projet

**DANGER** : Ne pas lire ces documents risque de détruire du travail existant ou de recréer des fonctionnalités déjà implémentées.

### 📊 Relations entre Documents

```
CLAUDE.md (vous êtes ici)
    ├── Documentation/
    │   ├── RAPPORT_SUCCESSEUR_2025-01-17.md (🚨 PRIORITÉ - État critique)
    │   ├── Handover_phase_2.md (Détails techniques + bugs)
    │   └── sécurité/
    │       └── SYNTHESE_UNIFIED_DEFENSE_STRATEGY.md (Architecture cible)
    ├── PRD.md (Vision - STABLE)
    ├── WORK_COMPLETED.md (Fait - À METTRE À JOUR) ←→ TODO.md
    ├── TODO.md (À faire - À METTRE À JOUR) ←→ WORK_COMPLETED.md
    └── README.md (Public - STABLE)
```

## 📋 Check-list de Démarrage de Session

- [ ] J'ai lu le RAPPORT_SUCCESSEUR pour comprendre l'état critique actuel
- [ ] J'ai identifié les 7 bugs critiques dans Handover_phase_2.md
- [ ] J'ai compris l'architecture cible dans SYNTHESE_UNIFIED_DEFENSE_STRATEGY.md
- [ ] J'ai lu le PRD.md et compris la vision produit
- [ ] J'ai vérifié dans WORK_COMPLETED.md ce qui existe déjà
- [ ] J'ai consulté TODO.md pour identifier la prochaine tâche
- [ ] Je ne vais PAS refactorer l'architecture existante sans avoir corrigé les bugs

## Commands

### Development
- `npm run dev` - Start Vite development server (frontend only)
- `npm run tauri:dev` - Start full Tauri development environment with hot reload
- `npm run build` - Build frontend for production
- `npm run tauri:build` - Build native macOS application (.app bundle)

### Installation
- `npm install` - Install all JavaScript dependencies
- First run requires Rust toolchain (rustc, cargo) installed

## Architecture

This is a native macOS application built with Tauri (Rust) and SolidJS, designed for high performance and minimal resource usage.

### Technology Stack
- **Backend**: Tauri v2 (Rust) - provides native APIs and window management
- **Frontend**: SolidJS + TypeScript - reactive UI with fine-grained updates
- **Styling**: Tailwind CSS with custom macOS glassmorphism design
- **Build**: Vite for frontend, Cargo for Rust backend

### Core Features
1. **Menu Bar Integration** - Lives in macOS system tray with quick access
2. **Floating Windows** - Independent note windows with always-on-top support
3. **Native Performance** - ~12MB bundle, ~60MB RAM usage

### Project Structure
```
src-tauri/          # Rust backend
  lib.rs           # Main Tauri commands and window management
  tauri.conf.json  # Tauri configuration
src/               # SolidJS frontend
  App.tsx          # Main application component
  index.css        # Tailwind + custom macOS styles
```

### Key Tauri Commands
- `create_floating_window(label, width, height)` - Creates new floating note window
- `toggle_always_on_top(window)` - Toggles window always-on-top state  
- `show_in_menu_bar()` - Hides main window, shows only in menu bar

### Component Libraries Available
- **@kobalte/core** v0.13.10 - Headless UI components installed
- **@ark-ui/solid** v5.1.0 - Cross-framework components for SolidJS installed

### State Management
- Uses SolidJS signals for reactive state
- Window state managed by Tauri
- Data persistence planned for SQLite or file system

### Styling Philosophy
- Native macOS look with glassmorphism effects
- Dark theme optimized with transparency
- System font stack for native feel (-apple-system)
- Custom scrollbars matching macOS style
- Custom Tailwind color palette for macOS:
  - `macos-bg`: rgba(30, 30, 30, 0.85)
  - `macos-sidebar`: rgba(40, 40, 40, 0.95)
  - `macos-hover`: rgba(60, 60, 60, 0.9)
  - `macos-border`: rgba(255, 255, 255, 0.1)
  - `macos-text`: rgba(255, 255, 255, 0.9)
  - `macos-text-secondary`: rgba(255, 255, 255, 0.6)

### Security & Permissions
- Uses `macos-private-api` for system tray features
- Minimal permissions requested
- No network access by default

## Development Notes

### Window Types
1. **Main Window** - Primary interface with sidebar and editor
2. **Floating Windows** - Lightweight note windows, skip taskbar
3. **System Tray** - Always accessible, click to show/hide

### Important Patterns
- All window creation goes through Tauri commands
- Use `getCurrentWindow()` for window-specific operations
- Drag regions defined with CSS classes: `.drag-region` and `.no-drag`
- Always handle Tauri command errors gracefully
- System tray handles left/right click events differently
- Floating windows automatically set `skip_taskbar: true` and `always_on_top: true`
- Main window starts `visible: false` and is shown after tray setup

### Performance Considerations  
- SolidJS compiles to vanilla JS (no VDOM overhead)
- Lazy load components not immediately needed
- Use CSS containment for complex layouts
- Minimize re-renders with proper signal usage
- Custom CSS classes for glassmorphism effects reduce inline styles
- Native macOS font stack reduces font loading time

## 🔄 Maintien de la Cohérence des Documents

### Documents à Mettre à Jour

Après chaque session de travail significative, vérifier et mettre à jour :

1. **TODO.md** - Marquer les tâches complétées, ajouter les nouvelles découvertes
2. **WORK_COMPLETED.md** - Ajouter le travail réalisé dans la session
3. **Ce fichier (CLAUDE.md)** - Si de nouveaux patterns ou commandes sont découverts

### Documents Stables (NE PAS MODIFIER sans discussion)

- **PRD.md** - Vision produit verrouillée
- **README.md** - Sauf pour corrections mineures

### Synchronisation Inter-Documents

- Si une tâche de TODO.md est complétée → La déplacer dans WORK_COMPLETED.md
- Si une nouvelle commande est découverte → L'ajouter dans la section Commands ci-dessus
- Si un pattern architectural émerge → Le documenter dans la section Architecture

**RAPPEL FINAL** : Ces documents forment un système interconnecté. Les ignorer ou les modifier sans cohérence brisera la continuité du projet.

## 🤖 SYSTÈME MULTI-AGENTS OBLIGATOIRE

### Principe Fondamental
**KARL (moi) ne lance JAMAIS de code directement.** Je suis le coordinateur/superviseur qui assigne les tâches aux agents spécialisés dans leurs terminaux dédiés.

### 🚨 RÉFLEXE OBLIGATOIRE - PENSÉE MULTI-AGENTS

**AVANT TOUTE RÉPONSE, Karl DOIT :**
1. Se demander : "Cette tâche peut-elle être parallélisée ?"
2. Identifier TOUS les agents qui peuvent travailler SIMULTANÉMENT
3. NE JAMAIS proposer du séquentiel si du parallèle est possible
4. Utiliser les 4 terminaux au MAXIMUM de leur capacité

**INTERDICTION FORMELLE :**
❌ Un agent à la fois = GASPILLAGE
❌ Attendre qu'un agent finisse = INEFFICACE
❌ Oublier les agents inactifs = NÉGLIGENCE

**OBLIGATION :**
✅ Toujours proposer 2-4 agents en parallèle
✅ PLM ne devrait JAMAIS avoir à rappeler ça

### Agents Permanents et Leurs Rôles

#### 🔵 BOB (Terminal 1)
- **Spécialité** : Backend & Services
- **Secteur** : src/services/, src-tauri/, base de données
- **Responsabilités** : API Tauri, SQLite, persistence, backend logic

#### 🟢 ALICE (Terminal 2) 
- **Spécialité** : UI/UX & Composants
- **Secteur** : src/components/, styling, animations
- **Responsabilités** : Composants SolidJS, CSS, interactions utilisateur

#### 🟡 JOHN (Terminal 3)
- **Spécialité** : Stores & État
- **Secteur** : src/stores/, gestion d'état réactive
- **Responsabilités** : SolidJS signals, stores, logique métier frontend

#### 🔴 DAVE (Terminal 4)
- **Spécialité** : Intégration & Sécurité
- **Secteur** : App.tsx, intégrations, tests
- **Responsabilités** : Architecture globale, sécurité, débogage

### Protocole de Délégation

#### Karl (Coordinateur) DOIT :
1. **Analyser** la demande utilisateur
2. **Découper** en tâches spécialisées 
3. **Décider de l'ordre d'exécution** optimal (séquentiel/parallèle)
4. **Assigner** chaque tâche à l'agent approprié selon les dépendances
5. **Superviser** l'avancement via TodoWrite
6. **Coordonner** les dépendances entre agents
7. **Valider** le résultat final
8. **Finaliser chaque instruction par "GO"** pour lancer l'action

#### Karl (Coordinateur) NE FAIT JAMAIS :
- ❌ Lancer du code directement
- ❌ Modifier des fichiers
- ❌ Utiliser les outils de développement
- ❌ Bypasser le système multi-agents

### ⚠️ RÈGLE ANTI-ZÈLE

**INTERDICTION ABSOLUE :**
❌ Améliorer sans demande explicite
❌ Ajouter des features non demandées
❌ "Optimiser" quand on demande juste de réparer

**OBLIGATION :**
✅ Faire EXACTEMENT ce qui est demandé
✅ Si ambiguïté → DEMANDER avant d'agir
✅ "Restaurer" = remettre comme avant, POINT.

**Exemples :**
- PLM: "Le resize ne marche pas" → Réparer, PAS améliorer
- PLM: "Rendre plus visible" → LÀ on peut améliorer

### 📋 CHECKLIST KARL - Ne Pas Attendre PLM

**AVANT TOUTE RÉPONSE, Karl DOIT :**
1. Se demander : "Cette tâche peut-elle être parallélisée ?"
2. Identifier TOUS les agents qui peuvent travailler SIMULTANÉMENT
3. NE JAMAIS proposer du séquentiel si du parallèle est possible
4. Utiliser les 4 terminaux au MAXIMUM de leur capacité

**INTERDICTION FORMELLE :**
❌ Un agent à la fois = GASPILLAGE
❌ Attendre qu'un agent finisse = INEFFICACE
❌ Oublier les agents inactifs = NÉGLIGENCE

**OBLIGATION :**
✅ Toujours proposer 2-4 agents en parallèle
✅ PLM ne devrait JAMAIS avoir à rappeler ça

### 🔴 PERSISTENCE (Toujours vérifier)
- [ ] Si on crée une donnée → Elle doit avoir une table DB
- [ ] Si on modifie une donnée → Elle doit être sauvée en DB
- [ ] Si on affiche une donnée → Elle doit être chargée depuis DB
- [ ] Sélecteurs, badges, noms, filtres → TOUT doit persister

### 🟡 FONCTIONNALITÉS COMPLÈTES
- [ ] Click sélecteur → Devient actif + Filtre les notes
- [ ] Renommer → Persiste en DB
- [ ] Badge → Se met à jour en temps réel
- [ ] Fermer/Rouvrir → Tout est restauré exactement

### 🔵 TESTS SYSTÉMATIQUES
- [ ] Créer → Fermer → Rouvrir → Vérifier
- [ ] Chaque feature → Test complet end-to-end
- [ ] Si ça ne persiste pas → C'est pas fini

### Assignation des Tâches

**Format d'instruction pour PLM :**
```
PLM, peux-tu donner cette mission à [AGENT] dans son terminal :

"[AGENT] ([Terminal X]): [Description précise de la tâche]
- Fichiers concernés: [liste]
- Objectif: [résultat attendu]
- Dépendances: [si applicable]"
```

### Exemples d'Assignation

**Tâche UI :**
> "Alice (T2): Implémenter badge compteur sur SelectorGrid.tsx"

**Tâche Backend :**  
> "Bob (T1): Ajouter endpoint SQLite pour persistence selectorId"

**Tâche Store :**
> "John (T3): Créer computed memo pour compter articles par sélecteur"

**Tâche Intégration :**
> "Dave (T4): Intégrer nouveau composant dans App.tsx avec gestion d'erreurs"

### Règles de Coordination

1. **Une tâche = Un agent** (pas de parallélisme sur même fichier)
2. **Ordre d'exécution obligatoire** (Karl décide séquentiel/parallèle selon dépendances)
3. **Dépendances claires** (agent A finit avant agent B si nécessaire)
4. **Communication via Karl** (pas de communication directe entre agents)
5. **Validation systématique** (Karl vérifie chaque étape)
6. **Rollback sécurisé** (git status avant/après chaque intervention)
7. **GO obligatoire** (chaque instruction Karl se termine par "GO" pour validation)

### Phrases Déclencheurs pour PLM

Quand PLM dit :
- "lance [agent]" → Karl donne instruction spécifique
- "qu'est-ce qu'il fait [agent]" → Karl vérifie le statut
- "agent suivant" → Karl passe à la tâche suivante
- "rollback" → Karl coordonne la restauration

**IMPORTANT** : Ce système garantit la qualité, évite les conflits de fichiers, et maintient la cohérence architecturale du projet.