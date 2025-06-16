# Test du Double-Click Handler

## Modifications apportées

1. **App.tsx** - Ajout du handler `handleSelectorDoubleClick` qui :
   - Vérifie qu'une note est sélectionnée
   - Assigne le sélecteur à la note courante via `assignSelectorToNote`
   - Affiche un message de confirmation dans la console

2. **SelectorGrid** - La prop `onSelectorDoubleClick` était déjà présente et est maintenant connectée

3. **BilliardSelector** - Le handler `onDblClick` était déjà implémenté

## Test à effectuer

1. Ouvrir l'application
2. Créer ou sélectionner une note
3. Double-cliquer sur un sélecteur (boule de billard)
4. Vérifier dans la console : "Sélecteur X assigné à la note courante"
5. La note devrait maintenant avoir le sélecteur assigné (visible dans la liste des notes)

## Code ajouté

```typescript
const handleSelectorDoubleClick = (selectorId: number) => {
  const note = selectedNote();
  if (note) {
    assignSelectorToNote(note.id, selectorId);
    console.log(`Sélecteur ${selectorId} assigné à la note courante`);
  } else {
    console.log("Aucune note sélectionnée pour l'assignation");
  }
};
```

## Résultat attendu

- Double-click sur sélecteur → Assignation immédiate à la note courante
- Feedback dans la console
- La note affiche le sélecteur dans la liste