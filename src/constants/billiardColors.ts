import { SelectorColors } from '../types/selectors'

// Palette de couleurs inspirée des vraies boules de billard
// avec adaptations pour le thème glassmorphism macOS
export const BILLIARD_COLORS: SelectorColors = {
  1: {
    primary: '#FFD700', // Or - Jaune
    secondary: '#FFA500',
    active: '#FFED4A',
    hover: '#FFE55C',
    glow: 'rgba(255, 215, 0, 0.4)'
  },
  2: {
    primary: '#4169E1', // Bleu Royal
    secondary: '#1E3A8A',
    active: '#60A5FA',
    hover: '#3B82F6',
    glow: 'rgba(65, 105, 225, 0.4)'
  },
  3: {
    primary: '#DC143C', // Rouge Cramoisie
    secondary: '#B91C1C',
    active: '#F87171',
    hover: '#EF4444',
    glow: 'rgba(220, 20, 60, 0.4)'
  },
  4: {
    primary: '#8B008B', // Magenta Foncé
    secondary: '#7C2D92',
    active: '#C084FC',
    hover: '#A855F7',
    glow: 'rgba(139, 0, 139, 0.4)'
  },
  5: {
    primary: '#FF8C00', // Orange Foncé
    secondary: '#EA580C',
    active: '#FB923C',
    hover: '#F97316',
    glow: 'rgba(255, 140, 0, 0.4)'
  },
  6: {
    primary: '#228B22', // Vert Forêt
    secondary: '#166534',
    active: '#4ADE80',
    hover: '#22C55E',
    glow: 'rgba(34, 139, 34, 0.4)'
  },
  7: {
    primary: '#8B0000', // Rouge Foncé
    secondary: '#7F1D1D',
    active: '#F87171',
    hover: '#EF4444',
    glow: 'rgba(139, 0, 0, 0.4)'
  },
  8: {
    primary: '#2F2F2F', // Noir/Gris Foncé
    secondary: '#1F2937',
    active: '#6B7280',
    hover: '#4B5563',
    glow: 'rgba(47, 47, 47, 0.4)'
  },
  9: {
    primary: '#FFD700', // Or avec rayures
    secondary: '#FFA500',
    active: '#FFED4A',
    hover: '#FFE55C',
    glow: 'rgba(255, 215, 0, 0.4)'
  },
  10: {
    primary: '#4169E1', // Bleu avec rayures
    secondary: '#1E3A8A',
    active: '#60A5FA',
    hover: '#3B82F6',
    glow: 'rgba(65, 105, 225, 0.4)'
  }
}

// Mapping des groupes vers les couleurs
export const getGroupColor = (groupId: number): SelectorColors[number] => {
  const colorIndex = ((groupId - 1) % 10) + 1
  return BILLIARD_COLORS[colorIndex]
}

// Couleurs de base pour les groupes de 10
export const GROUP_COLORS = [
  BILLIARD_COLORS[1], // Groupe 1-10: Jaune/Or
  BILLIARD_COLORS[2], // Groupe 11-20: Bleu
  BILLIARD_COLORS[3], // Groupe 21-30: Rouge
  BILLIARD_COLORS[4], // Groupe 31-40: Magenta
  BILLIARD_COLORS[5], // Groupe 41-50: Orange
  BILLIARD_COLORS[6], // Groupe 51-60: Vert
  BILLIARD_COLORS[7], // Groupe 61-70: Rouge Foncé
  BILLIARD_COLORS[8], // Groupe 71-80: Noir/Gris
  BILLIARD_COLORS[9], // Groupe 81-90: Jaune rayé
  BILLIARD_COLORS[10] // Groupe 91-100: Bleu rayé
]

// Noms des groupes
export const GROUP_NAMES = [
  "Solides", "Rayées", "Brillantes", "Prismes", "Neons", 
  "Naturels", "Profonds", "Sombres", "Dorés", "Cristaux"
]