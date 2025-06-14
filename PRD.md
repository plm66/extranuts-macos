# Product Requirements Document - Extranuts macOS

## 📌 Document de Référence

**Version**: 1.0  
**Date**: 2025-06-14  
**Status**: Document de référence - NE PAS MODIFIER sans discussion explicite

> ⚠️ **IMPORTANT POUR CLAUDE CODE**: Ce document est la source de vérité. Toujours vérifier WORK_COMPLETED.md avant de modifier l'architecture existante. Ne jamais reconstruire ce qui existe déjà.
> 
> 📖 **Ce document fait partie du système documentaire décrit dans [CLAUDE.md](CLAUDE.md)**

---

## 1. Vision Produit

### 1.1 Mission
Créer l'application de prise de notes la plus rapide et la moins intrusive pour macOS, vivant principalement dans la menu bar avec des fenêtres flottantes ultra-légères.

### 1.2 Proposition de Valeur Unique
- **Invisible jusqu'au besoin** : Vit dans la menu bar, 0 encombrement
- **Fenêtres flottantes** : Notes toujours accessibles sans changer de contexte
- **Performance native** : <100MB RAM, démarrage instantané
- **Workflow macOS** : Intégration profonde avec l'écosystème Apple

### 1.3 Anti-features (Ce que nous NE ferons PAS)
- Pas de synchronisation cloud complexe (seulement backup local/iCloud)
- Pas de collaboration temps réel
- Pas de formatting complexe (Markdown simple uniquement)
- Pas de version Windows/Linux

---

## 2. Utilisateurs Cibles

### 2.1 Persona Principal : "Le Développeur Multitâche"
- **Profil** : Développeur/Designer travaillant sur plusieurs projets
- **Besoins** : Notes rapides pendant le code, TODOs, snippets
- **Frustrations** : Apps lourdes, changement de contexte, perte de focus
- **Usage** : 10-20 notes courtes par jour, fenêtres flottantes sur second écran

### 2.2 Persona Secondaire : "Le Créatif Organisé"
- **Profil** : Writer/Chercheur/Étudiant
- **Besoins** : Capture d'idées rapide, organisation par projets
- **Frustrations** : Friction pour créer une note, retrouver l'information
- **Usage** : Notes plus longues, utilise tags et recherche

---

## 3. Fonctionnalités Core (MVP)

### 3.1 Menu Bar Integration ✅
**Status**: IMPLÉMENTÉ
- Icône toujours visible dans la menu bar
- Click gauche : Show/Hide fenêtre principale
- Click droit : Menu contextuel
- Badge avec nombre de notes non lues

### 3.2 Fenêtres Flottantes ✅
**Status**: IMPLÉMENTÉ (base)
- Création illimitée de fenêtres notes
- Always-on-top toggle par fenêtre
- Taille/position persistante
- Semi-transparence configurable

### 3.3 Système de Notes 🔄
**Status**: À IMPLÉMENTER
- Création instantanée (< 100ms)
- Auto-save en temps réel
- Markdown basique (bold, italic, lists, code)
- Titre auto-généré depuis première ligne

### 3.4 Organisation 🔄
**Status**: À IMPLÉMENTER
- Tags (multi-sélection)
- Catégories (une seule par note)
- Pin/Unpin
- Recherche instantanée full-text

---

## 4. Architecture Technique (VERROUILLÉE)

> ⚠️ **NE PAS CHANGER** : Cette architecture a été choisie pour des raisons de performance

### 4.1 Stack
- **Backend**: Tauri v2 (Rust) ✅
- **Frontend**: SolidJS + TypeScript ✅
- **Styling**: Tailwind CSS ✅
- **Components**: Ark UI / Kobalte (à installer)
- **Storage**: SQLite embarqué (à implémenter)

### 4.2 Structure Projet ✅
```
extranuts-macos/
├── src-tauri/      # ✅ NE PAS REFACTORER
├── src/            # ✅ NE PAS REFACTORER
├── PRD.md          # CE DOCUMENT
├── TODO.md         # Liste des tâches
├── WORK_COMPLETED.md # Travail déjà fait
└── CLAUDE.md       # Instructions Claude
```

---

## 5. Spécifications Détaillées

### 5.1 Performance
- **Démarrage** : < 500ms
- **RAM** : < 60MB idle, < 100MB actif
- **CPU** : < 1% idle
- **Taille bundle** : < 20MB

### 5.2 Fenêtre Principale
- **Largeur** : 1200px (défaut), min 800px
- **Hauteur** : 800px (défaut), min 600px
- **Sidebar** : 240px fixe
- **Redimensionnable** : Oui
- **Position** : Mémorisée

### 5.3 Fenêtres Flottantes
- **Taille défaut** : 400x300px
- **Taille min** : 200x150px
- **Transparence** : 85% (configurable 50-100%)
- **Coins arrondis** : 12px
- **Ombre** : macOS native

### 5.4 Raccourcis Clavier
- `Cmd+Shift+N` : Nouvelle note (global)
- `Cmd+Shift+F` : Recherche rapide (global)
- `Cmd+N` : Nouvelle fenêtre flottante (in-app)
- `Cmd+W` : Fermer fenêtre courante
- `Cmd+,` : Préférences

---

## 6. Flux Utilisateur Critiques

### 6.1 Première Utilisation
1. Download → Install → Launch
2. Icône apparaît dans menu bar
3. Tooltip "Click pour ouvrir Extranuts"
4. Premier click → Fenêtre principale avec note de bienvenue
5. Bouton évident "Créer première note"

### 6.2 Création Note Rapide
1. Click icône menu bar OU Cmd+Shift+N
2. Nouvelle note créée instantanément
3. Curseur prêt à taper
4. Auto-save dès première frappe
5. Titre = première ligne non vide

### 6.3 Workflow Fenêtre Flottante
1. Note ouverte → Click "Float" OU drag note vers extérieur
2. Fenêtre flottante créée à la position souris
3. Toggle "📌" pour always-on-top
4. Redimensionner/repositionner → mémorisé
5. Fermer → retour dans liste principale

---

## 7. Décisions Produit Clés

### 7.1 Stockage
- **Décision** : SQLite local uniquement
- **Raison** : Performance, simplicité, pas de dépendance réseau
- **Chemin** : `~/Library/Application Support/Extranuts/notes.db`

### 7.2 Sync
- **Décision** : Backup iCloud optionnel (v1.1)
- **Raison** : Éviter complexité, focus sur performance locale

### 7.3 Markdown
- **Décision** : Support minimal (bold, italic, lists, code, links)
- **Raison** : 90% des besoins, évite complexité éditeur

### 7.4 Thèmes
- **Décision** : Dark mode uniquement au départ
- **Raison** : Cohérence avec menu bar, évite fragmentation

---

## 8. Roadmap Produit

### Phase 1 : MVP (Current)
- [x] Architecture de base
- [ ] CRUD notes complet
- [ ] Fenêtres flottantes stables
- [ ] Recherche basique
- [ ] Tags & Catégories

### Phase 2 : Polish
- [ ] Animations fluides
- [ ] Préférences utilisateur
- [ ] Export (MD, TXT, PDF)
- [ ] Raccourcis personnalisables
- [ ] Onboarding

### Phase 3 : Power Features
- [ ] Templates
- [ ] Quick capture (sélection → note)
- [ ] Liens entre notes
- [ ] Archive/Corbeille
- [ ] Stats d'usage

---

## 9. Métriques de Succès

### 9.1 Performance
- ✅ Démarrage < 500ms
- ✅ RAM < 100MB
- ⏳ 0 crash sur 1000 heures d'usage

### 9.2 Usage
- ⏳ 50% utilisateurs actifs quotidiens
- ⏳ Moyenne 10 notes/jour/utilisateur
- ⏳ 30% utilisent fenêtres flottantes

### 9.3 Satisfaction
- ⏳ NPS > 50
- ⏳ 4.5+ étoiles sur App Store
- ⏳ < 2% désinstallation première semaine

---

## 10. Contraintes & Risques

### 10.1 Contraintes Techniques
- macOS 10.15+ uniquement
- Signature développeur Apple requise
- Notarization pour distribution

### 10.2 Risques Identifiés
- **Risque** : Conflit avec autres apps menu bar
- **Mitigation** : Option position icône

- **Risque** : Performance fenêtres multiples
- **Mitigation** : Limite souple 20 fenêtres

- **Risque** : Perte de données
- **Mitigation** : Auto-save agressif + backup

---

## 📋 Check-list Avant Développement

Avant CHAQUE session de développement :

1. [ ] Lire WORK_COMPLETED.md
2. [ ] Vérifier TODO.md pour prochaine tâche
3. [ ] Confirmer dans PRD.md que la tâche suit la vision
4. [ ] NE PAS refactorer l'existant sans discussion
5. [ ] NE PAS changer l'architecture de base

---

**FIN DU DOCUMENT - v1.0**