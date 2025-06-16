import { invoke } from '@tauri-apps/api/core'

export interface EditorPreferences {
  confirm_delete: boolean
  auto_save: boolean
  auto_save_interval: number
  font_family: string
  font_size: number
}

export interface AppearancePreferences {
  theme: 'dark' | 'light' | 'auto'
}

export interface WindowPreferences {
  default_width: number
  default_height: number
  transparency: number
}

export interface SyncSettings {
  icloud_sync_enabled: boolean
}

export interface ExportPreferences {
  obsidian_vault_path: string | null
}

export interface Preferences {
  sync: SyncSettings
  window: WindowPreferences
  editor: EditorPreferences
  export: ExportPreferences
  appearance: AppearancePreferences
}

export const preferencesService = {
  async getPreferences(): Promise<Preferences> {
    return await invoke<Preferences>('get_preferences')
  },

  async updatePreferences(preferences: Preferences): Promise<void> {
    await invoke('update_preferences', { preferences })
  },

  async updateEditorPreferences(editor: Partial<EditorPreferences>): Promise<void> {
    const current = await this.getPreferences()
    const updated = {
      ...current,
      editor: {
        ...current.editor,
        ...editor
      }
    }
    await this.updatePreferences(updated)
  },

  async updateAppearancePreferences(appearance: Partial<AppearancePreferences>): Promise<void> {
    const current = await this.getPreferences()
    const updated = {
      ...current,
      appearance: {
        ...current.appearance,
        ...appearance
      }
    }
    await this.updatePreferences(updated)
  }
}