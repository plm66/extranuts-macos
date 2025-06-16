// Debug des badges de sélecteurs
import { notes, assignSelectorToNote } from './stores/noteStore'
import { articleCountsBySelector, getArticleCountForSelector } from './stores/selectorsStore'

// Exposer les fonctions de debug dans la console
(window as any).debugBadges = {
  // Voir toutes les notes avec leur selectorId
  showNotes: () => {
    console.log('📋 TOUTES LES NOTES:')
    notes().forEach(note => {
      console.log(`- ${note.title} (ID: ${note.id}) - SelectorId: ${note.selectorId || 'AUCUN'}`)
    })
  },
  
  // Voir les comptages par sélecteur
  showCounts: () => {
    console.log('📊 COMPTAGES PAR SÉLECTEUR:')
    const counts = articleCountsBySelector()
    console.log('Map complète:', counts)
    console.log('Sélecteurs avec notes:')
    Array.from(counts.entries())
      .filter(([_, count]) => count > 0)
      .forEach(([selectorId, count]) => {
        console.log(`  - Sélecteur ${selectorId}: ${count} notes`)
      })
  },
  
  // Assigner une note à un sélecteur
  assignNote: async (noteId: string, selectorId: number) => {
    console.log(`🔧 Assignation de la note ${noteId} au sélecteur ${selectorId}`)
    await assignSelectorToNote(noteId, selectorId)
  },
  
  // Obtenir le premier ID de note disponible
  getFirstNoteId: () => {
    const firstNote = notes()[0]
    if (firstNote) {
      console.log(`📝 Première note: "${firstNote.title}" (ID: ${firstNote.id})`)
      return firstNote.id
    }
    console.log('❌ Aucune note disponible')
    return null
  },
  
  // Test rapide : assigner la première note au sélecteur 1
  testAssign: async () => {
    const noteId = (window as any).debugBadges.getFirstNoteId()
    if (noteId) {
      await (window as any).debugBadges.assignNote(noteId, 1)
      setTimeout(() => {
        console.log('⏱️ Après 1 seconde:')
        ;(window as any).debugBadges.showCounts()
      }, 1000)
    }
  },
  
  // Vérifier un sélecteur spécifique
  checkSelector: (selectorId: number) => {
    const count = getArticleCountForSelector(selectorId)
    console.log(`🎱 Sélecteur ${selectorId} a ${count} notes`)
    
    // Lister les notes de ce sélecteur
    const notesForSelector = notes().filter(n => n.selectorId === selectorId)
    if (notesForSelector.length > 0) {
      console.log('Notes assignées:')
      notesForSelector.forEach(n => console.log(`  - "${n.title}" (ID: ${n.id})`))
    }
  },
  
  // Test flow complet
  testFlow: async () => {
    console.log('🧪 TEST FLOW COMPLET')
    console.log('===================')
    
    // 1. État initial
    console.log('1️⃣ ÉTAT INITIAL:')
    ;(window as any).debugBadges.showNotes()
    ;(window as any).debugBadges.showCounts()
    
    // 2. Récupérer quelques notes
    const allNotes = notes()
    if (allNotes.length < 2) {
      console.log('❌ Pas assez de notes pour le test (minimum 2)')
      return
    }
    
    // 3. Assigner des notes à différents sélecteurs
    console.log('\n2️⃣ ASSIGNATION DE NOTES:')
    const note1 = allNotes[0]
    const note2 = allNotes[1]
    
    console.log(`- Assignation de "${note1.title}" au sélecteur 1`)
    await assignSelectorToNote(note1.id, 1)
    
    console.log(`- Assignation de "${note2.title}" au sélecteur 2`)
    await assignSelectorToNote(note2.id, 2)
    
    // 4. Vérifier immédiatement après assignation
    console.log('\n3️⃣ ÉTAT APRÈS ASSIGNATION:')
    ;(window as any).debugBadges.showCounts()
    ;(window as any).debugBadges.checkSelector(1)
    ;(window as any).debugBadges.checkSelector(2)
    
    // 5. Réassigner une note
    console.log(`\n4️⃣ RÉASSIGNATION de "${note1.title}" au sélecteur 2`)
    await assignSelectorToNote(note1.id, 2)
    
    // 6. Vérifier l'état final
    console.log('\n5️⃣ ÉTAT FINAL:')
    ;(window as any).debugBadges.showCounts()
    ;(window as any).debugBadges.checkSelector(1)
    ;(window as any).debugBadges.checkSelector(2)
    console.log('\n✅ TEST FLOW TERMINÉ')
  }
}

console.log(`
🐛 DEBUG BADGES ACTIVÉ! 
Utilisez ces commandes dans la console:
- debugBadges.showNotes() : Voir toutes les notes
- debugBadges.showCounts() : Voir les comptages
- debugBadges.assignNote(noteId, selectorId) : Assigner une note
- debugBadges.getFirstNoteId() : Obtenir l'ID de la première note
- debugBadges.testAssign() : Test rapide d'assignation
- debugBadges.checkSelector(id) : Vérifier un sélecteur spécifique
- debugBadges.testFlow() : Test flow complet avec réassignation
`)