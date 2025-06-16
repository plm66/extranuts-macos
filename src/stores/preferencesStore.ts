import { createSignal } from 'solid-js'
import { preferencesService, type Preferences } from '../services/preferences'

// Default preferences
const defaultPreferences: Preferences = {
  sync: {
    icloud_sync_enabled: false
  },
  window: {
    default_width: 400,
    default_height: 300,
    transparency: 0.85
  },
  editor: {
    confirm_delete: true,
    auto_save: true,
    auto_save_interval: 30,
    font_family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    font_size: 11
  },
  export: {
    obsidian_vault_path: null
  },
  appearance: {
    theme: 'dark'
  }
}

export const [preferences, setPreferences] = createSignal<Preferences>(defaultPreferences)

export async function loadPreferences() {
  try {
    const prefs = await preferencesService.getPreferences()
    setPreferences(prefs)
  } catch (err) {
    console.error('Failed to load preferences:', err)
  }
}

export async function updatePreferences(updates: Partial<Preferences>) {
  const current = preferences()
  const updated = {
    sync: { ...current.sync, ...(updates.sync || {}) },
    window: { ...current.window, ...(updates.window || {}) },
    editor: { ...current.editor, ...(updates.editor || {}) },
    export: { ...current.export, ...(updates.export || {}) },
    appearance: { ...current.appearance, ...(updates.appearance || {}) }
  }
  
  try {
    await preferencesService.updatePreferences(updated)
    setPreferences(updated)
  } catch (err) {
    console.error('Failed to update preferences:', err)
  }
}

export async function toggleDeleteConfirmation() {
  const current = preferences()
  await updatePreferences({
    editor: {
      ...current.editor,
      confirm_delete: !current.editor.confirm_delete
    }
  })
}

export async function updateTheme(theme: 'dark' | 'light' | 'auto') {
  await updatePreferences({
    appearance: {
      theme
    }
  })
}