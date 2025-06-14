# Extranuts macOS

<p align="center">
  <img src="src-tauri/icons/icon.png" alt="Extranuts Logo" width="128" height="128">
</p>

<p align="center">
  <strong>L'application de prise de notes la plus rapide et discrète pour macOS</strong>
</p>

<p align="center">
  Vivez dans votre menu bar • Fenêtres flottantes • Performance native
</p>

---

## ✨ Caractéristiques

- 🎯 **Menu Bar Native** - Toujours accessible, jamais envahissant
- 🪟 **Fenêtres Flottantes** - Notes indépendantes always-on-top
- ⚡ **Ultra-Performant** - <60MB RAM, démarrage instantané
- 🎨 **Design macOS** - Glassmorphism, transparence, intégration système
- 📝 **Markdown Simple** - Focus sur l'écriture, pas sur le formatage
- 🔍 **Recherche Instantanée** - Retrouvez tout en millisecondes

## 🚀 Installation

### Prérequis

- macOS 10.15 ou plus récent
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (dernière version stable)

### Développement

```bash
# Cloner le repository
git clone https://github.com/yourusername/extranuts-macos.git
cd extranuts-macos

# Installer les dépendances
npm install

# Lancer en mode développement
npm run tauri:dev
```

### Build de Production

```bash
# Créer l'application macOS
npm run tauri:build

# L'app sera dans src-tauri/target/release/bundle/macos/Extranuts.app
```

## 🎮 Utilisation

### Raccourcis Globaux

- `Cmd+Shift+N` - Nouvelle note rapide
- `Cmd+Shift+F` - Recherche globale

### Dans l'Application

- `Cmd+N` - Nouvelle fenêtre flottante
- `Cmd+W` - Fermer la fenêtre courante
- `Cmd+,` - Préférences

### Menu Bar

- **Click gauche** - Afficher/Masquer l'application
- **Click droit** - Menu contextuel

## 🏗️ Architecture

```
extranuts-macos/
├── src-tauri/          # Backend Rust (Tauri)
│   ├── src/           # Code source Rust
│   └── icons/         # Icônes de l'application
├── src/               # Frontend SolidJS
│   ├── components/    # Composants réutilisables
│   └── styles/        # Styles Tailwind
├── PRD.md            # Product Requirements Document
├── TODO.md           # Tâches restantes
└── WORK_COMPLETED.md # Travail accompli
```

### Stack Technique

- **Backend**: [Tauri v2](https://tauri.app/) (Rust)
- **Frontend**: [SolidJS](https://www.solidjs.com/) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build**: [Vite](https://vitejs.dev/)

## 🤝 Contribution

Les contributions sont les bienvenues ! Avant de contribuer :

1. Lisez le [PRD.md](PRD.md) pour comprendre la vision
2. Consultez [TODO.md](TODO.md) pour les tâches disponibles
3. Vérifiez [WORK_COMPLETED.md](WORK_COMPLETED.md) pour éviter les doublons

### Processus

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📋 Documentation Développeur

- [CLAUDE.md](CLAUDE.md) - Guide pour Claude Code AI
- [PRD.md](PRD.md) - Spécifications produit détaillées
- [TODO.md](TODO.md) - Roadmap et tâches

## 🔧 Dépannage

### L'app ne se lance pas

```bash
# Vérifier les logs
npm run tauri:dev -- --verbose

# Reconstruire depuis zéro
rm -rf node_modules src-tauri/target
npm install
npm run tauri:dev
```

### Icône menu bar invisible

- Vérifiez que `src-tauri/icons/icon.png` existe
- L'icône doit être en template format (noir et blanc)

## 📊 Performance

- **Bundle Size**: ~12MB
- **RAM (idle)**: ~50MB
- **RAM (actif)**: <100MB
- **Démarrage**: <500ms
- **CPU (idle)**: <1%

## 🔐 Confidentialité

- **Aucune télémétrie**
- **Aucune connexion réseau** (sauf futures mises à jour)
- **Données stockées localement** dans `~/Library/Application Support/Extranuts/`

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Tauri](https://tauri.app/) pour le framework
- [SolidJS](https://www.solidjs.com/) pour la réactivité
- La communauté Rust & JavaScript

---

<p align="center">
  Fait avec ❤️ pour macOS
</p>