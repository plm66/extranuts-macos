# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ LECTURE OBLIGATOIRE DES DOCUMENTS

**AVANT TOUTE ACTION, vous DEVEZ lire dans cet ordre :**

1. **[PRD.md](PRD.md)** - Vision produit et décisions verrouillées
2. **[WORK_COMPLETED.md](WORK_COMPLETED.md)** - Travail déjà réalisé (NE PAS REFAIRE)
3. **[TODO.md](TODO.md)** - Prochaines tâches à effectuer
4. **[README.md](README.md)** - Vue d'ensemble du projet

**DANGER** : Ne pas lire ces documents risque de détruire du travail existant ou de recréer des fonctionnalités déjà implémentées.

### 📊 Relations entre Documents

```
CLAUDE.md (vous êtes ici)
    ├── PRD.md (Vision - STABLE)
    ├── WORK_COMPLETED.md (Fait - À METTRE À JOUR) ←→ TODO.md
    ├── TODO.md (À faire - À METTRE À JOUR) ←→ WORK_COMPLETED.md
    └── README.md (Public - STABLE)
```

## 📋 Check-list de Démarrage de Session

- [ ] J'ai lu le PRD.md et compris la vision produit
- [ ] J'ai vérifié dans WORK_COMPLETED.md ce qui existe déjà
- [ ] J'ai consulté TODO.md pour identifier la prochaine tâche
- [ ] Je ne vais PAS refactorer l'architecture existante sans discussion explicite

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