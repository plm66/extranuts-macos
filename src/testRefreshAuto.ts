// Test du refresh automatique après actions CRUD
import { createNote, notes, loadNotes } from './stores/noteStore'

// Exposer le test dans la console
(window as any).testRefreshAuto = {
  // Test création de note avec refresh automatique
  testCreateNote: async () => {
    console.log('🧪 TEST REFRESH AUTO - CREATE NOTE')
    console.log('==================================')
    
    // 1. État initial
    console.log('1️⃣ Notes avant création:', notes().length)
    console.log('Notes:', notes().map(n => ({ id: n.id, title: n.title })))
    
    // 2. Créer une nouvelle note
    console.log('\n2️⃣ Création d\'une nouvelle note...')
    const newNote = await createNote('Test Note Auto Refresh ' + Date.now())
    console.log('Note créée:', newNote)
    
    // 3. Vérifier immédiatement (le refresh auto devrait avoir eu lieu)
    console.log('\n3️⃣ Notes après création (refresh auto):', notes().length)
    console.log('Notes:', notes().map(n => ({ id: n.id, title: n.title })))
    
    // 4. Vérifier que la nouvelle note est bien présente
    const foundNote = notes().find(n => n.id === newNote?.id)
    if (foundNote) {
      console.log('✅ SUCCESS: Note trouvée dans le signal notes() après refresh auto!')
      console.log('Note trouvée:', { id: foundNote.id, title: foundNote.title })
    } else {
      console.log('❌ FAIL: Note non trouvée dans le signal notes()')
    }
    
    return newNote
  },
  
  // Test du flow complet
  testFullFlow: async () => {
    console.log('🧪 TEST FLOW COMPLET REFRESH AUTO')
    console.log('=================================')
    
    // 1. Créer une note
    console.log('\n1️⃣ CRÉATION')
    const note = await (window as any).testRefreshAuto.testCreateNote()
    
    if (!note) {
      console.log('❌ Échec de la création')
      return
    }
    
    // 2. Attendre un peu pour voir si tout est stable
    console.log('\n⏳ Attente de 2 secondes...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 3. Vérifier que la note est toujours là
    console.log('\n2️⃣ VÉRIFICATION FINALE')
    const stillThere = notes().find(n => n.id === note.id)
    if (stillThere) {
      console.log('✅ Note toujours présente après 2 secondes')
      console.log('Détails:', { id: stillThere.id, title: stillThere.title })
    } else {
      console.log('❌ Note disparue après 2 secondes!')
    }
    
    console.log('\n✅ TEST TERMINÉ')
  },
  
  // Refresh manuel pour comparaison
  manualRefresh: async () => {
    console.log('🔄 Refresh manuel des notes...')
    await loadNotes()
    console.log('✅ Refresh terminé, notes:', notes().length)
  }
}

console.log(`
🚀 TEST REFRESH AUTO JOHN ACTIVÉ!
Commandes disponibles:
- testRefreshAuto.testCreateNote() : Test création avec refresh auto
- testRefreshAuto.testFullFlow() : Test flow complet
- testRefreshAuto.manualRefresh() : Refresh manuel pour debug
`)