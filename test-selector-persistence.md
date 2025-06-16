# Test de Persistance des Sélecteurs

## État des modifications

### ✅ Backend (Rust/SQLite)

1. **Migration de base de données** : Ajout de la colonne `selector_id INTEGER` dans la table `notes`
2. **Repository** : Toutes les requêtes SQL (INSERT, UPDATE, SELECT) incluent maintenant `selector_id`
3. **Models** : Le champ `selector_id` était déjà présent dans les structures Rust

### ✅ Frontend (TypeScript)

1. **Service de notes** : La fonction `convertNote` inclut maintenant `selector_id` dans la conversion
2. **Les requêtes `createNote` et `updateNote`** passent correctement le `selector_id` au backend

## Test de persistance

Pour tester la persistance :

1. Lancer l'application : `npm run tauri:dev`
2. Créer une nouvelle note
3. Assigner un sélecteur (badge) à la note
4. Observer les logs dans la console :
   - `🔧 notesService.updateNote - Request avec selector_id`
   - `🔧 Backend update_note command called with request`
   - `🔧 Backend selector_id reçu`
5. Fermer complètement l'application
6. Relancer l'application
7. Vérifier que le badge est toujours présent sur la note

## Points de vérification

- [ ] La colonne `selector_id` est créée dans SQLite
- [ ] Les valeurs de `selector_id` sont sauvegardées lors de l'update
- [ ] Les valeurs de `selector_id` sont récupérées lors du chargement des notes
- [ ] Les badges persistent après fermeture/réouverture de l'app

## Commandes utiles pour debug

```bash
# Voir la structure de la base SQLite
sqlite3 ~/Library/Application\ Support/com.extranuts.app/extranuts.db ".schema notes"

# Voir les notes avec leur selector_id
sqlite3 ~/Library/Application\ Support/com.extranuts.app/extranuts.db "SELECT id, title, selector_id FROM notes;"
```