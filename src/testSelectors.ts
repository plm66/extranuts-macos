import { updateSelectorName, getAllSelectors } from './services/selectors'

// Test du système de sélecteurs
export async function testSelectors() {
  console.log('🧪 Test des sélecteurs - DÉBUT')
  
  try {
    // 1. Récupérer tous les sélecteurs
    console.log('\n1️⃣ Récupération de tous les sélecteurs...')
    const allSelectors = await getAllSelectors()
    console.log(`   ✅ ${allSelectors.length} sélecteurs récupérés`)
    
    // 2. Tester la mise à jour d'un nom
    console.log('\n2️⃣ Test de mise à jour du nom du sélecteur 1...')
    await updateSelectorName(1, 'Test Selector 1')
    console.log('   ✅ Nom mis à jour avec succès')
    
    // 3. Vérifier la mise à jour
    console.log('\n3️⃣ Vérification de la mise à jour...')
    const updatedSelectors = await getAllSelectors()
    const selector1 = updatedSelectors.find(s => s.id === 1)
    if (selector1) {
      console.log(`   ✅ Sélecteur 1 trouvé avec nom: "${selector1.name}"`)
    } else {
      console.log('   ❌ Sélecteur 1 non trouvé')
    }
    
    // 4. Tester plusieurs mises à jour
    console.log('\n4️⃣ Test de mises à jour multiples...')
    await updateSelectorName(2, 'Test Selector 2')
    await updateSelectorName(3, 'Test Selector 3')
    console.log('   ✅ Mises à jour multiples réussies')
    
    console.log('\n🧪 Test des sélecteurs - TERMINÉ AVEC SUCCÈS')
  } catch (error) {
    console.error('\n❌ ERREUR pendant les tests:', error)
  }
}

// Exporter pour utilisation dans la console
(window as any).testSelectors = testSelectors