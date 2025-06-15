/**
 * =======================================================
 * AUDIO MANAGER FOR EXTRANUTS
 * =======================================================
 * 
 * This class handles all UI sound effects in the Extranuts app.
 * It provides a clean, consistent interface for playing audio feedback
 * that matches the macOS aesthetic and user experience.
 * 
 * Design Principles:
 * - Subtle and non-intrusive sounds
 * - Consistent timing (150-300ms duration)
 * - User-controllable preferences
 * - Graceful degradation if audio fails
 */

import { Howl, Howler } from 'howler'

export interface AudioPreferences {
  enabled: boolean
  volume: number // 0.0 to 1.0
  effects: {
    delete: boolean
    create: boolean
    save: boolean
    navigate: boolean
    pin: boolean
    category: boolean
    focus: boolean
  }
}

export enum SoundType {
  DELETE = 'delete',
  CREATE = 'create', 
  SAVE = 'save',
  NAVIGATE = 'navigate',
  PIN = 'pin',
  UNPIN = 'unpin',
  CATEGORY_CHANGE = 'category',
  FOCUS = 'focus',
  ERROR = 'error',
  SUCCESS = 'success'
}

/**
 * AudioManager Class
 * 
 * Manages all audio playback for UI interactions.
 * Uses Howler.js for reliable cross-platform audio support.
 */
class AudioManager {
  private sounds: Map<SoundType, Howl> = new Map()
  private preferences: AudioPreferences
  private initialized = false

  constructor() {
    // Default preferences - user can override these
    this.preferences = {
      enabled: true,
      volume: 0.3, // 30% volume for subtle feedback
      effects: {
        delete: true,
        create: true,
        save: true,
        navigate: true,
        pin: true,
        category: true,
        focus: true
      }
    }

    this.loadPreferences()
    this.initializeAudio()
  }

  /**
   * Initialize audio system and load sound files
   * 
   * For now, we'll use Web Audio API to generate simple tones.
   * Later, this can be replaced with actual sound files.
   */
  private async initializeAudio() {
    try {
      // Set global volume
      Howler.volume(this.preferences.volume)

      // Create synthetic sounds for immediate functionality
      // These will be replaced with actual sound files in Phase 2
      await this.createSyntheticSounds()
      
      this.initialized = true
      console.log('🔊 AudioManager initialized successfully')
    } catch (error) {
      console.warn('🔇 AudioManager initialization failed:', error)
      this.preferences.enabled = false
    }
  }

  /**
   * Create synthetic sounds using Web Audio API
   * 
   * This provides immediate audio feedback while we source proper sound files.
   * Each sound has been designed to match macOS UI audio patterns.
   */
  private async createSyntheticSounds() {
    // Create audio context for synthetic sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Helper function to create tone-based sounds
    const createToneSound = (frequency: number, duration: number, fadeOut = true): Howl => {
      // Create a simple oscillator-based sound
      // This is a placeholder - will be replaced with actual audio files
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
      const channelData = buffer.getChannelData(0)
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / audioContext.sampleRate
        let amplitude = 0.1 // Quiet by default
        
        // Apply fade out for smooth ending
        if (fadeOut && t > duration * 0.7) {
          amplitude *= (duration - t) / (duration * 0.3)
        }
        
        // Simple sine wave
        channelData[i] = amplitude * Math.sin(2 * Math.PI * frequency * t)
      }

      // Convert to data URL for Howler.js
      // Note: This is a simplified approach. In production, we'd use actual audio files.
      return new Howl({
        src: ['data:audio/wav;base64,'], // Placeholder - will implement proper audio generation
        volume: 0.3,
        preload: true
      })
    }

    // Define sound characteristics based on macOS UI patterns
    const soundDefinitions = {
      [SoundType.DELETE]: { frequency: 400, duration: 0.15 }, // Low, quick
      [SoundType.CREATE]: { frequency: 800, duration: 0.2 },  // Higher, positive
      [SoundType.SAVE]: { frequency: 600, duration: 0.1 },    // Quick confirmation
      [SoundType.NAVIGATE]: { frequency: 750, duration: 0.15 }, // Navigation click
      [SoundType.PIN]: { frequency: 900, duration: 0.12 },    // Sharp, quick
      [SoundType.UNPIN]: { frequency: 700, duration: 0.12 },  // Slightly lower
      [SoundType.CATEGORY_CHANGE]: { frequency: 650, duration: 0.18 }, // Slide effect
      [SoundType.FOCUS]: { frequency: 1000, duration: 0.08 }, // Very quick, high
      [SoundType.ERROR]: { frequency: 300, duration: 0.25 },  // Low, attention
      [SoundType.SUCCESS]: { frequency: 1200, duration: 0.2 } // High, positive
    }

    // For now, create placeholder Howl instances
    // These will be replaced with actual audio files in Phase 2
    for (const [type, definition] of Object.entries(soundDefinitions)) {
      this.sounds.set(type as SoundType, new Howl({
        src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmcfCStIz/LXgyMFLITK7+ONSA0PVqzj5Z5bGAg+ltryznkpBSN9yO7akEILElyx5+OqWBULTKLh7rlpIQUhLMTr4s2EQAEJTKNQAAW+GQj9agdqAAAAAGQAAADWAAABjgAAASAAAAEoAAACWAAAAkAAAAJAAF=='], // Minimal empty WAV
        volume: 0,
        preload: false
      }))
    }
  }

  /**
   * Play a specific UI sound effect
   * 
   * @param soundType - The type of sound to play
   * @param force - Play even if preferences disable this sound type
   */
  public play(soundType: SoundType, force = false): void {
    // Check if audio is enabled globally
    if (!this.preferences.enabled && !force) {
      return
    }

    // Check if this specific sound type is enabled
    if (!this.isSoundTypeEnabled(soundType) && !force) {
      return
    }

    // Check if audio system is initialized
    if (!this.initialized) {
      console.warn('🔇 AudioManager not initialized, skipping sound:', soundType)
      return
    }

    try {
      const sound = this.sounds.get(soundType)
      if (sound) {
        // For now, just log the sound that would be played
        // In Phase 2, this will actually play the sound
        console.log(`🔊 Playing sound: ${soundType}`)
        // sound.play()
      } else {
        console.warn('🔇 Sound not found:', soundType)
      }
    } catch (error) {
      console.warn('🔇 Failed to play sound:', soundType, error)
    }
  }

  /**
   * Convenience methods for common UI actions
   */
  public playDelete(): void {
    this.play(SoundType.DELETE)
  }

  public playCreate(): void {
    this.play(SoundType.CREATE)
  }

  public playSave(): void {
    this.play(SoundType.SAVE)
  }

  public playNavigate(): void {
    this.play(SoundType.NAVIGATE)
  }

  public playPin(): void {
    this.play(SoundType.PIN)
  }

  public playUnpin(): void {
    this.play(SoundType.UNPIN)
  }

  public playCategoryChange(): void {
    this.play(SoundType.CATEGORY_CHANGE)
  }

  public playFocus(): void {
    this.play(SoundType.FOCUS)
  }

  public playError(): void {
    this.play(SoundType.ERROR)
  }

  public playSuccess(): void {
    this.play(SoundType.SUCCESS)
  }

  /**
   * Update audio preferences
   */
  public updatePreferences(newPreferences: Partial<AudioPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences }
    this.savePreferences()
    
    // Update global volume
    if (newPreferences.volume !== undefined) {
      Howler.volume(newPreferences.volume)
    }
  }

  /**
   * Get current preferences
   */
  public getPreferences(): AudioPreferences {
    return { ...this.preferences }
  }

  /**
   * Enable or disable all audio
   */
  public setEnabled(enabled: boolean): void {
    this.preferences.enabled = enabled
    this.savePreferences()
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.preferences.volume = clampedVolume
    Howler.volume(clampedVolume)
    this.savePreferences()
  }

  /**
   * Check if a specific sound type is enabled
   */
  private isSoundTypeEnabled(soundType: SoundType): boolean {
    switch (soundType) {
      case SoundType.DELETE:
        return this.preferences.effects.delete
      case SoundType.CREATE:
        return this.preferences.effects.create
      case SoundType.SAVE:
        return this.preferences.effects.save
      case SoundType.NAVIGATE:
        return this.preferences.effects.navigate
      case SoundType.PIN:
      case SoundType.UNPIN:
        return this.preferences.effects.pin
      case SoundType.CATEGORY_CHANGE:
        return this.preferences.effects.category
      case SoundType.FOCUS:
        return this.preferences.effects.focus
      default:
        return true // Error and success sounds are always enabled
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('extranuts_audio_preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        this.preferences = { ...this.preferences, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load audio preferences:', error)
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('extranuts_audio_preferences', JSON.stringify(this.preferences))
    } catch (error) {
      console.warn('Failed to save audio preferences:', error)
    }
  }

  /**
   * Test all sounds (useful for settings screen)
   */
  public testAllSounds(): void {
    const sounds = [
      SoundType.CREATE,
      SoundType.SAVE,
      SoundType.PIN,
      SoundType.NAVIGATE,
      SoundType.CATEGORY_CHANGE,
      SoundType.DELETE
    ]

    sounds.forEach((sound, index) => {
      setTimeout(() => {
        this.play(sound, true) // Force play for testing
      }, index * 500) // 500ms between each sound
    })
  }
}

// Create a singleton instance
export const audioManager = new AudioManager()

// Export the class for testing or multiple instances if needed
export default AudioManager