# Extranuts macOS - Travail Réalisé

> 📖 **Ce document fait partie du système documentaire décrit dans [CLAUDE.md](CLAUDE.md)**  
> ⚠️ **À METTRE À JOUR** : Ajouter ici toute tâche complétée depuis [TODO.md](TODO.md)

## 📋 Résumé du Projet

Une application native macOS de prise de notes construite avec les technologies modernes les plus performantes.

## 🛠 Stack Technique Choisie

### Frontend
- **Framework UI**: SolidJS (réactivité fine-grained, pas de Virtual DOM)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS avec design glassmorphism macOS
- **Composants**: Prévu pour Ark UI / Kobalte (headless components)

### Backend
- **Framework**: Tauri v2 (Rust)
- **Runtime**: Binaire natif (~12MB, ~60MB RAM)
- **APIs macOS**: Accès natif complet

## ✅ Fonctionnalités Implémentées

### 1. Structure du Projet
```
extranuts-macos/
├── src-tauri/           # Backend Rust
│   ├── src/
│   │   ├── lib.rs      # Logique principale avec commands Tauri
│   │   └── main.rs     # Point d'entrée
│   ├── Cargo.toml      # Dependencies Rust
│   ├── build.rs        # Build script
│   └── tauri.conf.json # Configuration Tauri
├── src/                 # Frontend SolidJS
│   ├── App.tsx         # Composant principal
│   ├── index.tsx       # Point d'entrée
│   └── index.css       # Styles Tailwind + macOS
├── package.json        # Dependencies npm
├── tsconfig.json       # Config TypeScript
├── vite.config.ts      # Config Vite
├── tailwind.config.js  # Config Tailwind
└── postcss.config.js   # Config PostCSS
```

### 2. Features Natives macOS

#### System Tray / Menu Bar
- Icône dans la barre de menu macOS
- Click gauche: afficher/masquer l'application
- Click droit: menu contextuel (à implémenter)
- Mode "Accessory" pour cacher du dock

#### Fenêtres Flottantes
- Command `create_floating_window` pour créer des notes indépendantes
- Support "Always on Top" avec toggle
- Fenêtres skip_taskbar (n'apparaissent pas dans le dock)
- Dimensions personnalisables

#### Window Management
- Fonction pour basculer en mode menu bar only
- Toggle always on top pour chaque fenêtre
- Support des événements window (focus, blur, etc.)

### 3. Interface Utilisateur

#### Design System
- Thème sombre avec transparence style macOS
- Glassmorphism avec backdrop blur
- Couleurs personnalisées pour macOS:
  - `macos-bg`: Background avec transparence
  - `macos-sidebar`: Sidebar avec effet verre
  - `macos-hover`: États hover
  - `macos-border`: Bordures subtiles
  - `macos-text`: Texte principal et secondaire

#### Composants UI
- Sidebar avec liste des notes
- Bouton "New Floating Note"
- Contrôles pour Always on Top et Hide to Menu Bar
- Zone principale pour l'édition
- Scrollbars natives macOS

### 4. Configuration Tauri

#### Permissions et APIs
- `macos-private-api`: APIs privées macOS
- `tray-icon`: Support system tray
- `devtools`: Outils de développement
- `shell`: Plugin shell pour commandes système

#### Build Configuration
- Frontend: Vite avec hot reload
- Target minimum: macOS 10.15
- Bundle actif pour .app
- Icônes configurées (à générer)

## 🔧 Commands Tauri Implémentées

1. **`create_floating_window`**
   - Paramètres: label, width, height
   - Crée une nouvelle fenêtre flottante

2. **`toggle_always_on_top`**
   - Paramètre: window
   - Bascule le mode always on top

3. **`show_in_menu_bar`**
   - Cache la fenêtre principale
   - Passe en mode Accessory (menu bar only)

## 📦 Scripts Disponibles

```bash
# Development
npm run dev          # Frontend seulement
npm run tauri:dev    # App complète avec Tauri

# Build
npm run build        # Build frontend
npm run tauri:build  # Build app native

# Preview
npm run preview      # Preview build frontend
```

## 🎨 Styles et UX

- Font système Apple (-apple-system)
- Anti-aliasing optimisé pour macOS
- Régions draggables pour déplacer les fenêtres
- Transitions smooth sur les interactions
- Support du mode sombre natif