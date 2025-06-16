# Pattern Composant-Hook-Store et Tests@gemini

**Analyse technique détaillée et recommandations pour sécuriser les composants et structurer le projet Tauri + SolidJS**

---

## Synthèse Rapide

Le pattern recommandé pour votre stack est une architecture hybride **"Composant-Hook-Store"** :

- **Composants** (`/components`) : Gèrent uniquement l'affichage (le "quoi"). Ils sont "bêtes" et reçoivent des données et des fonctions via leurs props.

- **Hooks personnalisés** (`/hooks`) : Encapsulent la logique et l'état local d'une fonctionnalité (le "comment"). Ils sont réutilisables et testables indépendamment de l'UI.

- **Stores** (`/stores`) : Gèrent l'état global et partagé de l'application (la "vérité unique").

Cette séparation claire des responsabilités est la clé pour éviter les régressions et simplifier la maintenance.

---

## Réponses Techniques Détaillées

### 1. Isolation des Composants

La meilleure approche est une **combinaison de A et B**.

**A. Extraire vers /components/ avec interfaces TypeScript strictes (Indispensable)** : C'est la base de la modularité. Chaque pièce d'UI réutilisable (barre de recherche, bouton, modal) doit être son propre composant dans `src/components/`. L'utilisation d'interfaces TypeScript strictes pour les props crée un contrat clair entre le composant et son parent, ce qui empêche les erreurs d'intégration.

**B. Créer des hooks personnalisés dans /hooks/ (Fortement Recommandé)** : La logique métier (ex: comment filtrer les notes, comment gérer l'état d'ouverture d'un modal) ne doit pas vivre dans le composant UI. En l'extrayant dans un hook (`useSearchBar`, `useExportModal`), vous la rendez réutilisable, plus facile à tester et indépendante de l'implémentation visuelle.

**C. Intégrer dans les stores existants (À utiliser avec parcimonie)** : Les stores sont pour l'état global partagé. La liste brute de toutes les notes, les catégories globales, ou les préférences utilisateur y ont leur place. Mais l'état local d'un composant (ex: le texte actuel dans la barre de recherche) n'a pas à polluer le store global.

**Conclusion pour la question 1 :**
Extraire la vue dans un composant (A) et sa logique dans un hook personnalisé (B). Le composant utilisera le hook pour fonctionner.

### 2. Protection contre la Régression

La stratégie la plus efficace est **A. Tests unitaires automatisés**, complétée par B et C.

**A. Tests unitaires automatisés (Stratégie Principale)** : C'est la seule méthode proactive pour garantir que les fonctionnalités ne sont pas cassées.

- **Pour les Hooks et Services** : Utilisez Vitest pour tester la logique pure (ex: `useNoteSearch`). C'est simple, rapide et ne nécessite pas de DOM.

- **Pour les Composants** : Utilisez Solid Testing Library avec Vitest. Cela vous permet de tester le rendu et les interactions de vos composants du point de vue de l'utilisateur.

**B. Documentation technique intégrée (Bonne Pratique)** : La documentation (ex: JSDoc sur les fonctions, les props des composants, et des fichiers README.md pour les fonctionnalités complexes) aide à la compréhension mais ne prévient pas activement la régression. C'est un complément essentiel pour la maintenance.

**C. Versioning par composant (Filet de Sécurité)** : C'est une stratégie de récupération, pas de prévention. Utiliser git de manière disciplinée (commits atomiques et messages clairs) est fondamental. Vous pouvez utiliser `git log -p -- src/components/SearchBar.tsx` pour voir l'historique d'un fichier, mais les tests vous diront avant de merger qu'il y a un problème.

**Conclusion pour la question 2 :**
Misez sur les tests automatisés (A) comme ligne de défense principale. La documentation (B) et un bon usage de Git (C) sont des pratiques de soutien cruciales.

### 3. Exemple Concret - Barre de Recherche

La meilleure approche est une **fusion des options A et B**. Ni l'un ni l'autre n'est complet seul.

- **Option A : Composant dédié** : Bon pour l'encapsulation de la vue, mais où vit la logique de filtrage ? Probablement à l'intérieur du composant, ce qui la rend difficile à réutiliser ou à tester.

- **Option B : Hook réutilisable** : Excellent pour la logique, mais ce n'est pas un composant. Vous devez toujours écrire le JSX quelque part.

**La solution idéale sépare les deux :**

- Le **Hook** (`useNoteSearch.ts`) gère la logique : état de la recherche, filtrage des notes.
- Le **Composant** (`SearchBar.tsx`) gère l'affichage : le champ de saisie, potentiellement une liste de résultats. Il utilise le hook.

### 4. Recommandations Architecturales

Le pattern architectural recommandé est celui qui maximise la **Séparation des Préoccupations** (Separation of Concerns).

- **Pour la récupération de composants supprimés** : Une discipline git rigoureuse est votre meilleur allié. Des commits fréquents et bien décrits vous permettent de retrouver n'importe quelle version d'un fichier ou d'annuler une modification (`git revert`).

- **Pour l'évolution indépendante** : La modularité via le pattern Composant-Hook-Store. Quand la logique de la recherche est dans `useNoteSearch.ts`, vous pouvez la modifier sans toucher au rendu du composant `SearchBar.tsx`, et vice-versa.

- **Pour la maintenance simplifiée** : Une structure de projet claire. Considérez un dossier `features/` ou `modules/` où chaque fonctionnalité (recherche, export, etc.) a son propre sous-dossier contenant ses composants, hooks, et tests spécifiques.

---

## Livrable Attendu

### 1. Pattern Recommandé pour les Nouveaux Composants

**Pattern "Feature-Centric avec Composant-Hook-Store"**

**Isoler par fonctionnalité** : Créez un dossier par fonctionnalité majeure (ex: `src/features/search/`, `src/features/export/`).

**Structure interne d'une feature :**
- `components/` : Contient les composants SolidJS purs (ex: `SearchBar.tsx`, `SearchResultList.tsx`).
- `hooks/` : Contient les hooks de logique (ex: `useNoteSearch.ts`).
- `services/` : Pour la logique sans état ou les appels externes (ex: `exportToObsidian.ts`).
- `index.ts` : Exporte les éléments publics de la feature (ex: le composant principal `Search`).

**Utiliser les Stores** (`src/stores/`) pour les données transverses (ex: `noteStore.ts` qui contient `allNotes` et les actions pour les modifier).

### 2. Exemple Concret d'Implémentation (Barre de Recherche)

#### Fichier : `src/stores/noteStore.ts` (État Global)

```typescript
import { createStore } from "solid-js/store";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

// Store contenant la liste brute de toutes les notes
const [notes, setNotes] = createStore<Note[]>([
  // ... vos notes initiales ou chargées depuis Rust
  { id: '1', title: "Idée de projet", content: "Utiliser Tauri et SolidJS", tags: ['dev'] },
  { id: '2', title: "Recette de cuisine", content: "Faire une tarte aux pommes", tags: ['perso'] },
]);

export { notes, setNotes };
```

#### Fichier : `src/hooks/useNoteSearch.ts` (Logique de la Feature)

```typescript
import { createSignal, createMemo, Accessor } from "solid-js";
import type { Note } from '../stores/noteStore';

// Le hook prend en dépendance la liste des notes à filtrer
export function useNoteSearch(allNotes: Accessor<Note[]>) {
  const [searchQuery, setSearchQuery] = createSignal("");

  // createMemo est parfait ici : il ne se recalcule que si searchQuery ou allNotes changent.
  const filteredNotes = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) {
      return allNotes(); // Retourne toutes les notes si la recherche est vide
    }
    return allNotes().filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  });

  return { searchQuery, setSearchQuery, filteredNotes };
}
```

#### Fichier : `src/components/SearchBar.tsx` (Composant UI "Bête")

```typescript
import { Component, Setter } from 'solid-js';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: Component<SearchBarProps> = (props) => {
  return (
    <input
      type="search"
      placeholder={props.placeholder || "Rechercher une note..."}
      value={props.query}
      onInput={(e) => props.onQueryChange(e.currentTarget.value)}
      class="search-input" // Appliquer vos styles
    />
  );
};
```

#### Fichier : `src/App.tsx` (Assemblage)

```typescript
import { Component, For } from 'solid-js';
import { notes } from './stores/noteStore';
import { useNoteSearch } from './hooks/useNoteSearch';
import { SearchBar } from './components/SearchBar';

const App: Component = () => {
  // 1. On récupère la logique de recherche via le hook.
  //    On lui passe un accesseur vers les notes du store.
  const { searchQuery, setSearchQuery, filteredNotes } = useNoteSearch(() => notes);

  return (
    <main>
      <h1>Mon Application de Notes</h1>

      {/* 2. On utilise le composant UI en lui passant l'état et le setter du hook */}
      <SearchBar query={searchQuery()} onQueryChange={setSearchQuery} />

      <hr />

      {/* 3. On affiche la liste des notes filtrées, calculée par le hook */}
      <h2>Résultats ({filteredNotes().length})</h2>
      <ul>
        <For each={filteredNotes()}>
          {(note) => <li>{note.title}</li>}
        </For>
      </ul>
    </main>
  );
};

export default App;
```

### 3. Stratégie de Protection contre les Régressions

#### Tests Unitaires (Priorité #1) :

Créez `src/hooks/useNoteSearch.test.ts` avec Vitest.

**Exemple de test :**

```typescript
import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { useNoteSearch } from './useNoteSearch';

describe('useNoteSearch', () => {
  it('should filter notes based on query', () => {
    createRoot(dispose => { // Les hooks de Solid ont besoin d'un contexte réactif
      const mockNotes = () => [
        { id: '1', title: "SolidJS", content: "framework" },
        { id: '2', title: "React", content: "library" },
      ];
      
      const { setSearchQuery, filteredNotes } = useNoteSearch(mockNotes);
      
      setSearchQuery('solid');
      expect(filteredNotes().length).toBe(1);
      expect(filteredNotes()[0].title).toBe('SolidJS');

      dispose();
    });
  });
});
```

#### Contrats Stricts (TypeScript) : 
Continuez à utiliser des interfaces (`Note`, `SearchBarProps`) pour tout. Cela attrape les erreurs de type à la compilation, avant même de lancer l'application.

#### Revue de Code et Git Flow : 
Adoptez un workflow de feature-branches. Chaque nouvelle fonctionnalité ou refactoring se fait dans une branche dédiée. Avant de merger dans la branche principale, faites une revue de code (Pull Request) où vous vérifiez :

- Que les tests passent.
- Que le nouveau code suit l'architecture définie.
- Que la fonctionnalité est bien isolée et ne casse rien d'existant.

---

## Avantages de cette Architecture

### ✅ Séparation Claire des Responsabilités
- **Composants** : Affichage pur, faciles à tester visuellement
- **Hooks** : Logique métier réutilisable et testable unitairement
- **Stores** : État global cohérent et centralisé

### ✅ Maintenabilité Maximale
- Chaque partie peut évoluer indépendamment
- Les bugs sont plus faciles à localiser
- Le refactoring devient moins risqué

### ✅ Testabilité Optimale
- Hooks testables sans UI (tests rapides)
- Composants testables indépendamment de la logique
- Stores testables en isolation

### ✅ Réutilisabilité
- Hooks partageables entre composants
- Composants réutilisables avec différentes logiques
- Architecture scalable pour de nouvelles features

---

*Document créé le 16 juin 2025 - Référence sécurité : Pattern Composant-Hook-Store et Tests@gemini*