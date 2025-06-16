# Module Header

Module header modulaire et découplé pour Extranuts macOS.

## Structure

```
src/modules/header/
├── HeaderLogo.tsx     # Logo + titre (30 lignes)
├── HeaderActions.tsx  # Boutons d'actions (40 lignes)
├── useHeader.ts      # Logique et hooks
└── index.tsx         # Exports centralisés
```

## Utilisation dans App.tsx

```tsx
import { HeaderLogo, HeaderActions, useHeader } from "./modules/header";

// Dans le composant App
const App: Component = () => {
  const { isAlwaysOnTop, toggleAlwaysOnTop, createFloatingWindow } = useHeader();

  return (
    <div class="h-16 sidebar-glass flex items-center justify-between px-6 border-b border-macos-border drag-region">
      <HeaderLogo title="Extranuts" />
      
      <HeaderActions
        onNewNote={createRegularNote}
        onFloat={createFloatingWindow}
        onPin={toggleAlwaysOnTop}
        onThemeToggle={() => themeStore.toggle()}
        isPinned={isAlwaysOnTop()}
      />
    </div>
  );
};
```

## Features

- **HeaderLogo** : Logo animé avec dégradé + titre personnalisable
- **HeaderActions** : Boutons New Note, Float, Pin avec icônes
- **useHeader** : Hook pour gérer always on top, floating windows, etc.
- **100% autonome** : Aucune dépendance sur App.tsx
- **Style cohérent** : Glassmorphism macOS intégré