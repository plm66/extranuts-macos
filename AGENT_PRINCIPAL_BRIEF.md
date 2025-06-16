# Brief Agent Principal - Implémentation Système de Thèmes

## 🎯 Votre Mission
Implémenter le système de thèmes dark/light de manière modulaire et sécurisée en suivant la todolist établie.

## 📋 Ordre d'Exécution des Tâches

### Phase 1 : Fondations (Priorité HAUTE)
1. **theme-1** : Créer `src/stores/themeStore.ts`
   - Signal pour theme: 'dark' | 'light' | 'auto'
   - Fonction pour toggle theme
   - Export des helpers nécessaires

2. **theme-3** : Créer `src/styles/themes.css`
   - Variables CSS pour dark theme
   - Variables CSS pour light theme
   - Système de variables réutilisables

3. **theme-5** : Modifier `src/index.css`
   - Ajouter classes `.theme-light` SANS toucher au dark existant
   - Utiliser les variables CSS créées
   - Conserver toute la structure existante

### Phase 2 : Composants (Priorité MOYENNE)
4. **theme-4** : Créer `src/components/ThemeToggle.tsx`
   - Bouton avec icône soleil/lune
   - Utiliser le themeStore
   - Placer dans un coin discret de l'interface

5. **theme-6** : Test sur App.tsx
   - Ajouter la classe dynamique sur le body ou root
   - Tester UNIQUEMENT le background principal
   - Valider que le toggle fonctionne

### Phase 3 : Intégration (après validation)
6. **theme-8** : Intégrer dans preferencesStore
7. **theme-7** : Adapter glassmorphism
8. Continuer selon la todolist...

## ⚠️ Points de Validation
- Après chaque tâche : taper "VALIDATION theme-X terminé"
- Attendre confirmation avant de continuer
- Si blocage : "BLOCAGE: [description]"

## 🛡️ Règles de Sécurité
1. NE JAMAIS supprimer de code existant
2. Toujours AJOUTER, jamais remplacer
3. Tester sur UN élément avant de propager
4. Commiter après chaque phase réussie

## 💬 Communication
- Pour assets : "BESOIN: [description]"
- Pour info : "INFO: [status]"
- Pour aide : "AIDE: [question]"

Confirmez avec "READY" quand vous êtes prêt à commencer.