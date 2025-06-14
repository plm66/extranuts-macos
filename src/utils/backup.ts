import { invoke } from '@tauri-apps/api/core'
import type { Note, Category, Tag } from '../types'

export interface BackupData {
  notes: Note[]
  categories: Category[]
  tags: Tag[]
  timestamp: string
  version: string
  totalNotes: number
}

export async function createFullBackup(
  notes: Note[], 
  categories: Category[], 
  tags: Tag[]
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  
  const backupData: BackupData = {
    notes,
    categories, 
    tags,
    timestamp: new Date().toISOString(),
    version: '1.0',
    totalNotes: notes.length
  }

  try {
    // First, try to save to Desktop using Tauri
    const jsonContent = JSON.stringify(backupData, null, 2)
    const markdownContent = generateMarkdownBackup(notes)
    
    const jsonFilename = `extranuts-backup-${timestamp}.json`
    const mdFilename = `extranuts-notes-${timestamp}.md`
    
    await invoke('save_backup_to_desktop', {
      jsonFilename,
      jsonContent,
      mdFilename, 
      mdContent: markdownContent
    })

    alert(`✅ EMERGENCY BACKUP COMPLETE!\n\n📊 ${notes.length} notes backed up\n🕒 ${new Date().toLocaleString()}\n\n💾 Files saved to Desktop:\n• ${jsonFilename}\n• ${mdFilename}\n\n🔒 Your data is now safe!`)

  } catch (error) {
    console.error('❌ Tauri backup failed, using fallback:', error)
    
    // Fallback: copy to clipboard
    const fallbackData = JSON.stringify(backupData, null, 2)
    try {
      await navigator.clipboard.writeText(fallbackData)
      alert(`❌ FILE SAVE FAILED - DATA COPIED TO CLIPBOARD!\n\n📊 ${notes.length} notes copied to clipboard\n🚨 PASTE INTO A TEXT FILE IMMEDIATELY!\n\nError: ${error}`)
    } catch (clipError) {
      // Ultimate fallback: show data in alert
      console.error('Clipboard also failed:', clipError)
      prompt(`🚨 URGENT: COPY THIS DATA TO A FILE!\n\nClipboard failed. Select all and copy:`, JSON.stringify(backupData, null, 2))
    }
  }
}

function generateMarkdownBackup(notes: Note[]): string {
  let markdown = `# Extranuts Notes Backup\n\n`
  markdown += `**Generated:** ${new Date().toLocaleString()}\n`
  markdown += `**Total Notes:** ${notes.length}\n\n`
  markdown += `---\n\n`

  notes.forEach((note) => {
    markdown += `## ${note.title}\n\n`
    markdown += `**Created:** ${new Date(note.createdAt).toLocaleString()}\n`
    markdown += `**Updated:** ${new Date(note.updatedAt).toLocaleString()}\n`
    
    if (note.tags.length > 0) {
      markdown += `**Tags:** ${note.tags.join(', ')}\n`
    }
    
    if (note.isPinned) {
      markdown += `**Status:** Pinned 📌\n`
    }
    
    if (note.isFloating) {
      markdown += `**Type:** Floating Window\n`
    }
    
    markdown += `\n${note.content}\n\n`
    markdown += `---\n\n`
  })

  return markdown
}