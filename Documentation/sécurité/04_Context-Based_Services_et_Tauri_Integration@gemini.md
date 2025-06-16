# Context-Based Services et Tauri Integration@gemini

**Architecture Recommandée basée sur les meilleures pratiques de la communauté SolidJS avec intégration Tauri v2 optimisée**

---

## Architecture Recommandée

### Pattern Architectural Principal : Context-Based Services

Basé sur les meilleures pratiques de la communauté SolidJS, le pattern recommandé consiste à **isoler chaque fonctionnalité dans un composant service** qui expose son API via un Context :

```typescript
// services/SearchService.tsx
import { createContext, useContext, createSignal, createMemo } from 'solid-js';
import type { Component, JSX } from 'solid-js';

interface SearchAPI {
  searchQuery: () => string;
  setSearchQuery: (query: string) => void;
  filteredNotes: () => Note[];
  selectedNote: () => Note | null;
  setSelectedNote: (note: Note) => void;
}

const SearchContext = createContext<SearchAPI>();

export const SearchService: Component<{ children: JSX.Element }> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedNote, setSelectedNote] = createSignal<Note | null>(null);
  
  // Récupération des notes depuis le service parent
  const notesAPI = useContext(NotesContext);
  
  const filteredNotes = createMemo(() => {
    const query = searchQuery().toLowerCase();
    if (!query) return notesAPI?.notes() || [];
    
    return notesAPI?.notes().filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    ) || [];
  });

  const api: SearchAPI = {
    searchQuery,
    setSearchQuery,
    filteredNotes,
    selectedNote,
    setSelectedNote
  };

  return (
    <SearchContext.Provider value={api}>
      {props.children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchService');
  }
  return context;
};
```

### Structure de Projet Optimisée

```
src/
├── components/              # Composants UI purs
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   ├── SearchBar.test.tsx
│   │   └── index.ts
│   ├── ExportModal/
│   └── CategoryManager/
├── services/               # Services/Contexts métier
│   ├── SearchService.tsx
│   ├── NotesService.tsx
│   ├── CategoryService.tsx
│   └── WikiLinksService.tsx
├── stores/                 # Stores globaux (si nécessaire)
├── utils/                  # Utilitaires et hooks
│   ├── hooks/
│   └── types.ts
├── tauri/                  # Commandes et types Tauri
│   ├── commands.ts
│   └── events.ts
└── App.tsx
```

---

## Isolation des Composants

### Option A : Composant Dédié avec Interface Stricte

```typescript
// components/SearchBar/SearchBar.tsx
import type { Component } from 'solid-js';
import { useSearch } from '../../services/SearchService';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
}

export const SearchBar: Component<SearchBarProps> = (props) => {
  const { searchQuery, setSearchQuery, selectedNote, setSelectedNote } = useSearch();
  
  return (
    <div class={`search-container ${props.className || ''}`}>
      <input
        type="text"
        placeholder={props.placeholder || "Rechercher dans les notes..."}
        value={searchQuery()}
        onInput={(e) => setSearchQuery(e.currentTarget.value)}
        onFocus={props.onFocus}
        class="search-input"
      />
      {selectedNote() && (
        <div class="selected-note">
          Note sélectionnée : {selectedNote()?.title}
        </div>
      )}
    </div>
  );
};
```

### Option B : Hook Personnalisé (Recommandé)

Inspiré des patterns discutés dans la communauté GitHub, voici un hook réutilisable :

```typescript
// utils/hooks/useNoteSearch.ts
import { createSignal, createMemo } from 'solid-js';
import type { Accessor } from 'solid-js';

export interface UseNoteSearchReturn {
  searchQuery: Accessor<string>;
  setSearchQuery: (query: string) => void;
  filteredNotes: Accessor<Note[]>;
  clearSearch: () => void;
}

export const useNoteSearch = (notes: Accessor<Note[]>): UseNoteSearchReturn => {
  const [searchQuery, setSearchQuery] = createSignal('');
  
  const filteredNotes = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) return notes();
    
    return notes().filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const clearSearch = () => setSearchQuery('');

  return {
    searchQuery,
    setSearchQuery,
    filteredNotes,
    clearSearch
  };
};
```

### Utilisation dans App.tsx

```typescript
// App.tsx
import { NotesService } from './services/NotesService';
import { SearchService } from './services/SearchService';
import { CategoryService } from './services/CategoryService';
import { SearchBar } from './components/SearchBar';

export default function App() {
  return (
    <NotesService>
      <CategoryService>
        <SearchService>
          <div class="app">
            <header>
              <SearchBar />
            </header>
            <main>
              {/* Autres composants */}
            </main>
          </div>
        </SearchService>
      </CategoryService>
    </NotesService>
  );
}
```

---

## Protection Contre les Régressions

### 1. Tests Unitaires Automatisés avec Vitest

Configuration optimale basée sur les bonnes pratiques :

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    deps: {
      inline: [/solid-js/, /@solidjs\/testing-library/]
    }
  },
  resolve: {
    conditions: ['development', 'browser']
  }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### 2. Tests de Composants Isolés

```typescript
// components/SearchBar/SearchBar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';
import { SearchService } from '../../services/SearchService';

// Mock du service de notes
const mockNotes = [
  { id: '1', title: 'Note 1', content: 'Contenu 1', tags: ['tag1'] },
  { id: '2', title: 'Note 2', content: 'Contenu 2', tags: ['tag2'] }
];

const TestWrapper = (props: { children: any }) => (
  <NotesService initialNotes={mockNotes}>
    <SearchService>
      {props.children}
    </SearchService>
  </NotesService>
);

describe('SearchBar', () => {
  it('should render search input', () => {
    render(() => (
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    ));
    
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter notes on input', async () => {
    const user = userEvent.setup();
    
    render(() => (
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    ));
    
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'Note 1');
    
    // Vérifier que le filtrage fonctionne
    expect(searchInput).toHaveValue('Note 1');
  });

  it('should clear search when requested', async () => {
    const user = userEvent.setup();
    
    render(() => (
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    ));
    
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'test');
    await user.clear(searchInput);
    
    expect(searchInput).toHaveValue('');
  });
});
```

### 3. Tests de Services

```typescript
// services/SearchService.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook } from '@solidjs/testing-library';
import { useSearch } from './SearchService';

describe('SearchService', () => {
  it('should provide search functionality', () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchService
    });
    
    expect(typeof result.searchQuery).toBe('function');
    expect(typeof result.setSearchQuery).toBe('function');
    expect(typeof result.filteredNotes).toBe('function');
  });
});
```

### 4. Documentation Technique Intégrée

```typescript
/**
 * Service de recherche pour les notes
 * 
 * @example
 * ```tsx
 * <SearchService>
 *   <SearchBar />
 * </SearchService>
 * ```
 * 
 * @version 1.0.0
 * @since 2024-01-01
 * 
 * @features
 * - Recherche temps réel
 * - Filtrage par titre, contenu et tags
 * - Sélection de notes
 * 
 * @breaking-changes
 * - v1.0.0: Interface initiale
 */
export const SearchService: Component<SearchServiceProps> = (props) => {
  // Implementation...
};
```

---

## Communication Tauri v2 - Frontend

### Pattern Commands et Events

```typescript
// tauri/commands.ts
import { invoke, Channel } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface ExportProgress {
  current: number;
  total: number;
  status: 'processing' | 'complete' | 'error';
  message: string;
}

export class TauriAPI {
  // Commande simple
  static async exportToObsidian(notes: Note[]): Promise<boolean> {
    return await invoke('export_to_obsidian', { notes });
  }

  // Commande avec canal de progression
  static async exportWithProgress(
    notes: Note[],
    onProgress: (progress: ExportProgress) => void
  ): Promise<void> {
    const progressChannel = new Channel<ExportProgress>();
    progressChannel.onmessage = onProgress;
    
    await invoke('export_with_progress', {
      notes,
      progressChannel
    });
  }

  // Écoute d'événements
  static onNotesChanged(callback: (notes: Note[]) => void) {
    return listen<Note[]>('notes-changed', (event) => {
      callback(event.payload);
    });
  }
}
```

### Intégration dans les Services

```typescript
// services/ExportService.tsx
import { createContext, useContext, createSignal } from 'solid-js';
import { TauriAPI, type ExportProgress } from '../tauri/commands';

interface ExportAPI {
  isExporting: () => boolean;
  exportProgress: () => ExportProgress | null;
  exportToObsidian: (notes: Note[]) => Promise<void>;
}

const ExportContext = createContext<ExportAPI>();

export const ExportService: Component<{ children: JSX.Element }> = (props) => {
  const [isExporting, setIsExporting] = createSignal(false);
  const [exportProgress, setExportProgress] = createSignal<ExportProgress | null>(null);

  const exportToObsidian = async (notes: Note[]) => {
    setIsExporting(true);
    setExportProgress(null);
    
    try {
      await TauriAPI.exportWithProgress(notes, (progress) => {
        setExportProgress(progress);
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const api: ExportAPI = {
    isExporting,
    exportProgress,
    exportToObsidian
  };

  return (
    <ExportContext.Provider value={api}>
      {props.children}
    </ExportContext.Provider>
  );
};

export const useExport = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExport must be used within ExportService');
  }
  return context;
};
```

---

## Stratégie de Versioning et Récupération

### 1. Git Hooks pour la Protection

```bash
#!/bin/sh
# .git/hooks/pre-commit
# Vérification des tests avant commit

npm run test
if [ $? -ne 0 ]; then
  echo "Les tests échouent. Commit annulé."
  exit 1
fi

npm run typecheck
if [ $? -ne 0 ]; then
  echo "Erreurs TypeScript détectées. Commit annulé."
  exit 1
fi
```

### 2. Tags par Fonctionnalité

```bash
# Taguer une version stable d'un composant
git tag -a searchbar-v1.0.0 -m "SearchBar: Version stable avec filtrage temps réel"
git tag -a export-modal-v1.0.0 -m "ExportModal: Support Obsidian complet"

# Récupérer une version spécifique
git checkout searchbar-v1.0.0 -- src/components/SearchBar/
```

### 3. Snapshot Testing pour les Composants Critiques

```typescript
// components/SearchBar/SearchBar.snapshot.test.tsx
import { describe, it } from 'vitest';
import { render } from '@solidjs/testing-library';
import { SearchBar } from './SearchBar';

describe('SearchBar Snapshots', () => {
  it('should match snapshot in default state', () => {
    const { container } = render(() => (
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    ));
    
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should match snapshot with search query', () => {
    const { container } = render(() => (
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    ));
    
    // Simuler une saisie
    const input = container.querySelector('input')!;
    input.value = 'test search';
    input.dispatchEvent(new Event('input'));
    
    expect(container.innerHTML).toMatchSnapshot();
  });
});
```

---

## Exemple Concret - Extraction de la Barre de Recherche

### Avant (inline dans App.tsx)

```typescript
// App.tsx (problématique)
export default function App() {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [notes, setNotes] = createSignal<Note[]>([]);
  const [selectedNote, setSelectedNote] = createSignal<Note | null>(null);

  const filteredNotes = createMemo(() => {
    // Logique de filtrage mélangée...
  });

  return (
    <div>
      <input 
        value={searchQuery()} 
        onInput={(e) => setSearchQuery(e.currentTarget.value)}
        // Logique UI mélangée avec la logique métier
      />
      {/* Autres composants... */}
    </div>
  );
}
```

### Après (architecture isolée)

```typescript
// App.tsx (solutionné)
export default function App() {
  return (
    <NotesService>
      <SearchService>
        <CategoryService>
          <WikiLinksService>
            <div class="app">
              <AppHeader />
              <AppMain />
            </div>
          </WikiLinksService>
        </CategoryService>
      </SearchService>
    </NotesService>
  );
}

// components/AppHeader.tsx
export const AppHeader: Component = () => {
  return (
    <header class="app-header">
      <SearchBar placeholder="Rechercher vos notes..." />
      <ExportButton />
    </header>
  );
};
```

---

## Recommandations Finales

### 1. Pattern Recommandé

- **Context-based Services** pour l'isolation des fonctionnalités
- **Hooks personnalisés** pour la logique réutilisable
- **Composants purs** pour l'UI

### 2. Protection Contre les Régressions

- **Tests unitaires** avec Vitest + @solidjs/testing-library
- **Snapshot testing** pour les composants critiques
- **Git hooks** pour validation automatique
- **Documentation intégrée** avec exemples

### 3. Outils Essentiels

- **Vitest** : Framework de test rapide
- **TypeScript strict** : Validation de types
- **@solidjs/testing-library** : Tests de composants isolés
- **Tauri Channels** : Communication frontend-backend

---

## Avantages de cette Architecture

### ✅ Isolation Parfaite
- Services encapsulés dans des contextes
- APIs claires et typées
- Aucun couplage entre fonctionnalités

### ✅ Testabilité Maximale
- Services testables indépendamment
- Composants mockables facilement
- Couverture de tests optimale

### ✅ Évolutivité
- Ajout de nouvelles fonctionnalités sans impact
- Refactoring sécurisé
- Migration progressive possible

### ✅ Performance
- Contextes optimisés SolidJS
- Memoization automatique
- Réactivité fine-grained préservée

### ✅ Intégration Tauri Optimisée
- Channels pour communication async
- Events pour synchronisation
- Commands typées et sécurisées

---

**Cette architecture garantit l'évolutivité, la maintenabilité et la récupération facile de fonctionnalités supprimées accidentellement, tout en maintenant une séparation claire des responsabilités entre les couches UI, logique métier et communication système.**

---

*Document créé le 16 juin 2025 - Référence sécurité : Context-Based Services et Tauri Integration@gemini*