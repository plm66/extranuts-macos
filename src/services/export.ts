import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'

export interface ExportResult {
  total_notes: number
  successful_exports: number
  failed_exports: Array<[string, string]>
  export_path: string
}

export const exportService = {
  async exportToObsidian(vaultPath: string, noteIds?: string[], targetFolder?: string): Promise<ExportResult> {
    // Convert string IDs to numbers for the backend
    const numericIds = noteIds ? noteIds.map(id => parseInt(id)) : undefined
    return await invoke<ExportResult>('export_to_obsidian', { 
      vaultPath, 
      noteIds: numericIds,
      targetFolder 
    })
  },

  async validateObsidianVault(vaultPath: string): Promise<boolean> {
    return await invoke<boolean>('validate_obsidian_vault', { vaultPath })
  },

  async selectObsidianVault(): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Obsidian Vault',
    })
    
    return selected as string | null
  }
}