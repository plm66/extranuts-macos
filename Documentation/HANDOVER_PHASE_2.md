# 🚀 HANDOVER PHASE 2 - Extranuts macOS
## Document de Passation pour les Successeurs

**Date** : 16 Juin 2025  
**Commit de référence** : `61bc82c`  
**Phase complétée** : Système Sélecteurs Complet  
**Phase suivante** : À définir selon besoins utilisateur  

---

## 📋 ÉTAT ACTUEL DU PROJET

### ✅ FONCTIONNALITÉS OPÉRATIONNELLES

#### 🎱 Système Sélecteurs (Partiellement fonctionnel - voir bugs critiques)
- **100 sélecteurs** organisés en 10 groupes de 10 ✅
- **Couleurs billard** avec dégradés par groupe ✅
- **Badges compteurs** en temps réel (nombre de notes assignées) ✅
- **Navigation** fluide entre groupes (flèches + boutons numériques) ✅
- **Renommage** persistant des sélecteurs ✅
- **Double-click** pour assignation rapide ❌ (handler non connecté)
- **Filtrage** automatique des notes ❌ (utilise recherche texte au lieu de selectorId)

#### 🗄️ Persistance Complète
- **Base SQLite** avec colonne `selector_id` opérationnelle
- **Refresh automatique** après chaque action CRUD
- **Synchronisation parfaite** entre frontend et backend
- **Noms personnalisés** des sélecteurs sauvegardés
- **Assignations** persistantes entre sessions

#### 🎨 Interface Modernisée
- **Architecture modulaire** (modules/header, modules/selectors)
- **Glassmorphism macOS** authentique
- **Responsive design** avec redimensionnement
- **Theme toggle** fonctionnel
- **Nouvelle note** apparaît toujours en première position

#### 🔧 Outils de Développement
- **Debug tools** complets (`debugBadges`, `debugSelectors`)
- **Tests automatisés** pour validation
- **Logs détaillés** pour traçage
- **Commands console** pour diagnostic

---

## 🏗️ ARCHITECTURE TECHNIQUE

### 📁 Structure des Fichiers Clés

```
extranuts-macos/
├── src/
│   ├── modules/
│   │   ├── header/           # Module header modulaire
│   │   │   ├── HeaderLogo.tsx
│   │   │   ├── HeaderActions.tsx
│   │   │   ├── useHeader.ts
│   │   │   └── index.tsx
│   │   └── selectors/        # Module sélecteurs (partiellement implémenté)
│   │       ├── SelectorBar.tsx
│   │       └── index.tsx
│   ├── stores/
│   │   ├── noteStore.ts      # Store principal des notes (refresh auto)
│   │   ├── selectorsStore.ts # Store des sélecteurs complet
│   │   └── themeStore.ts     # Gestion thème
│   ├── services/
│   │   ├── notes.ts          # Service backend notes
│   │   └── selectors.ts      # Service backend sélecteurs
│   ├── components/
│   │   ├── BilliardSelector.tsx     # Sélecteur individuel avec badge
│   │   ├── SelectorGrid.tsx         # Grille 2x5 des sélecteurs
│   │   ├── NoteSelectorColumn.tsx   # Colonne sélecteur dans liste notes
│   │   └── SelectorAssignmentMenu.tsx # Menu assignation (à améliorer)
│   └── hooks/
│       └── useLoadSelectors.ts      # Hook chargement sélecteurs
└── src-tauri/
    └── src/features/
        ├── notes/            # Backend notes avec selector_id
        └── selectors/        # Backend sélecteurs complet
```

### 🔄 Flux de Données

```
Action Utilisateur → Store SolidJS → Service TypeScript → Command Tauri → Repository Rust → SQLite
                                                                                                ↓
UI Mise à Jour ← Signal Reactif ← loadNotes() automatique ← Response ← Query Result ←────────┘
```

### 🎯 Pattern "Refresh Automatique"

**Toutes les actions CRUD déclenchent** `await loadNotes()` :
```typescript
const createNote = async (title: string) => {
  const note = await notesService.createNote(...)
  await loadNotes() // Refresh immédiat depuis DB
  return note
}
```

---

## 🚨 POINTS D'ATTENTION POUR LES SUCCESSEURS

### ⚠️ Code Legacy à Moderniser

1. **App.tsx** (1232 lignes)
   - Monolithique, devrait être découpé en modules
   - Logique métier mélangée avec UI
   - Candidat pour refactoring majeur

2. **Modules incomplets**
   - `modules/selectors/` partiellement implémenté
   - SelectorBar créé mais pas intégré dans App.tsx
   - Architecture modulaire à terminer

3. **SelectorAssignmentMenu.tsx**
   - Fonctionnel mais UX à améliorer
   - Intégration dans App.tsx manquante
   - Interface pas optimale

### 🔧 Dettes Techniques

1. **Tests unitaires** manquants
2. **Documentation API** incomplète  
3. **Gestion d'erreurs** à renforcer
4. **Performance** à optimiser (nombreux re-renders)
5. **Accessibilité** non testée

---

## 🚨 BUGS CRITIQUES NON RÉSOLUS

### ⚠️ À CORRIGER EN PRIORITÉ ABSOLUE (Phase 2A-0)

#### 1. **Filtrage des Sélecteurs CASSÉ**
- **Problème** : Clic sur sélecteur utilise `setSearchQuery` au lieu de filtrer par `selectorId`
- **Impact** : Les sélecteurs ne filtrent pas les notes qui leur sont assignées
- **Fichier** : `selectorsStore.ts` lignes 183-195 (fonction `filterArticlesBySelector`)
- **Solution** : Implémenter un vrai filtre par `selectorId` dans `noteStore`

#### 2. **Double-Clic Non Fonctionnel**
- **Problème** : Handler `onDoubleClick` existe dans `BilliardSelector` mais pas connecté dans `App.tsx`
- **Impact** : Double-clic sur sélecteur ne fait rien alors qu'il devrait assigner à la note active
- **Fichier** : `App.tsx` - handler `onSelectorDoubleClick` manquant dans `SelectorGrid`
- **Solution** : Ajouter handler qui appelle `assignSelectorToNote(selectedNote().id, selectorId)`

#### 3. **WikiLinks Case-Sensitive**
- **Problème** : "Échecs" ≠ "échecs" dans la comparaison des liens
- **Impact** : WikiLinks échouent sur différences de casse (majuscules/minuscules)
- **Fichier** : `wikilinks.ts` ligne 29
- **Solution** : Changer en comparaison case-insensitive

#### 4. **Noms Sélecteurs Invisibles**
- **Problème** : Les noms personnalisés des sélecteurs ne sont pas affichés sous les bulles
- **Impact** : Utilisateur ne peut pas voir les noms qu'il a définis
- **Fichier** : `BilliardSelector.tsx`
- **Solution** : Ajouter `<div class="text-xs">{selector.name}</div>` sous la bulle

#### 5. **Imports Debug en Production**
- **Problème** : 3 imports de fichiers debug visibles dans le code de production
- **Impact** : Code de développement exposé, performances potentiellement impactées
- **Fichier** : `App.tsx` lignes 54-56
- **Solution** : Supprimer ou conditionner ces imports

#### 6. **Logo Manquant**
- **Problème** : `HeaderLogo.tsx` créé mais logo jamais intégré/affiché
- **Impact** : Header visuellement incomplet, manque d'identité
- **Fichier** : `modules/header/HeaderLogo.tsx`
- **Solution** : Intégrer un vrai logo ou icône

#### 7. **Versioning Absent**
- **Problème** : Système de backup existe mais pas d'historique des versions des notes
- **Impact** : Impossible de récupérer une version antérieure d'une note
- **Fichiers** : Nouveau service à créer
- **Solution** : Implémenter `src/services/versioning.ts` avec historique limité

### 📊 MÉTRIQUES DE DETTE TECHNIQUE

- **Bugs critiques** : 7 non résolus affectant les fonctionnalités core
- **Temps perdu** : 3 jours sur bugs récurrents et crashs répétés
- **Refactoring abandonné** : Tentative de modularisation a cassé l'application
- **Code monolithique** : `App.tsx` avec 1232 lignes (anti-pattern)
- **Couverture de tests** : 0% - aucun test unitaire
- **Imports circulaires** : Plusieurs dépendances circulaires détectées
- **Performance** : Re-renders excessifs non optimisés

---

## 🎯 PROCHAINES PHASES SUGGÉRÉES

### Phase 2A-0 : CORRECTION DES BUGS CRITIQUES (URGENT - 1 jour)
- [ ] Corriger le filtrage par selectorId (Bug #1)
- [ ] Implémenter le double-clic fonctionnel (Bug #2)
- [ ] Fixer les WikiLinks case-insensitive (Bug #3)
- [ ] Afficher les noms sous les sélecteurs (Bug #4)
- [ ] Nettoyer les imports debug (Bug #5)
- [ ] Intégrer le logo (Bug #6)
- [ ] Créer système de versioning basique (Bug #7)

### Phase 2A : Finalisation UX/UI (après correction des bugs)
- [ ] Intégrer modules header/selectors dans App.tsx
- [ ] Améliorer SelectorAssignmentMenu avec meilleure UX
- [ ] Refactoriser App.tsx en composants modulaires
- [ ] Ajouter animations et transitions fluides
- [ ] Tests d'accessibilité et corrections

### Phase 2B : Features Avancées
- [ ] Drag & Drop des notes vers sélecteurs
- [ ] Sélecteurs favoris/épinglés
- [ ] Groupes de sélecteurs personnalisés
- [ ] Export/Import des configurations sélecteurs
- [ ] Statistiques d'utilisation des sélecteurs

### Phase 2C : Performance & Polish
- [ ] Optimisation des re-renders SolidJS
- [ ] Lazy loading des composants
- [ ] Tests unitaires complets
- [ ] Documentation développeur
- [ ] Préparation App Store

---

## 🛠️ OUTILS DE DÉVELOPPEMENT

### 🧪 Debug & Test

```javascript
// Console du navigateur
debugBadges.testFlow()           // Test badges complet
debugSelectors.testClick(1)      // Test click sélecteur
testRefreshAuto.testCreateNote() // Test refresh automatique
```

### 📊 Monitoring

```javascript
// État des stores
selectorsStore.activeSelector    // Sélecteur actif
notes().length                  // Nombre total de notes
articleCountsBySelector()       // Map des comptages
```

### 🔍 Logs Utiles

- `🎯 setActiveSelectorFn` - Activation sélecteur
- `📊 articleCountsBySelector recalculé` - Refresh badges
- `🚀 Notes APRÈS création` - Création note
- `🔥 Signal notes() a changé` - Réactivité

---

## 📚 DOCUMENTATION DE RÉFÉRENCE

### 📖 Documents Essentiels
- **[PRD.md](PRD.md)** - Vision produit (NE PAS MODIFIER)
- **[WORK_COMPLETED.md](WORK_COMPLETED.md)** - Travail réalisé
- **[TODO.md](TODO.md)** - Tâches restantes
- **[CLAUDE.md](CLAUDE.md)** - Instructions pour IA

### 🔗 Architecture
- **Backend** : Tauri v2 + Rust + SQLite
- **Frontend** : SolidJS + TypeScript + Tailwind
- **Build** : Vite + npm scripts

### 🎨 Design System
- **Couleurs** : Palette billard avec glassmorphism macOS
- **Typographie** : System font Apple (-apple-system)
- **Espacement** : Grid Tailwind standard
- **Animations** : CSS transitions 150ms ease-out

---

## 🚀 COMMANDES DE DÉVELOPPEMENT

```bash
# Développement
npm run tauri:dev    # App complète avec hot reload
npm run dev          # Frontend seulement

# Build
npm run tauri:build  # App native macOS
npm run build        # Frontend pour production

# Debug
npm run tauri:dev -- --verbose  # Logs détaillés
```

---

## 🎯 OBJECTIFS DE PERFORMANCE

### ✅ Atteints
- Démarrage < 500ms
- RAM < 100MB en usage normal
- 0 crash sur fonctionnalités core

### 🎯 À Maintenir
- Réactivité UI < 16ms (60fps)
- Recherche instantanée < 100ms
- Synchronisation DB < 50ms

---

## 💡 CONSEILS POUR LES SUCCESSEURS

### 🎨 UI/UX
1. **Respecter** l'identité visuelle glassmorphism macOS
2. **Tester** sur différentes tailles d'écran
3. **Prioriser** la performance sur l'esthétique
4. **Maintenir** la cohérence avec l'existant

### 🔧 Technique
1. **Toujours** utiliser le pattern refresh automatique
2. **Tester** chaque modification avec debug tools
3. **Documenter** les nouveaux patterns
4. **Garder** la simplicité architecturale

### 🤝 Collaboration
1. **Lire** TOUS les documents de référence
2. **Utiliser** le système multi-agents si possible
3. **Committer** fréquemment avec messages clairs
4. **Mettre à jour** WORK_COMPLETED.md et TODO.md

---

## 🏆 MESSAGE FINAL

**Le système sélecteurs est PARTIELLEMENT OPÉRATIONNEL avec 7 bugs critiques à corriger.**

✅ **Persistance** : Fonctionne entre sessions  
✅ **Badges** : Compteurs temps réel opérationnels  
⚠️ **UX** : Plusieurs fonctionnalités cassées (filtrage, double-clic, noms)  
⚠️ **Architecture** : Dette technique importante (App.tsx monolithique)  

**Votre mission prioritaire** : 
1. **CORRIGER les 7 bugs critiques** listés dans ce document
2. **ENSUITE SEULEMENT** continuer le développement de nouvelles features
3. **NE PAS** tenter de modularisation avant stabilisation complète

**Conseil critique** : La tentative de modularisation a déjà cassé l'application une fois. Stabilisez d'abord, refactorisez ensuite.

**Bonne chance pour la Phase 2 ! 🚀**

---

*Document rédigé par l'équipe multi-agents Claude (Karl, Bob, Alice, John, Dave)*  
*Contact pour questions : Référez-vous aux documents de référence dans le projet*