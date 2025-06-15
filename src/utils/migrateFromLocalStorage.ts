import { invoke } from '@tauri-apps/api/core';
import type { CreateNoteRequest } from '../types/models';

interface OldNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date | { __type: 'Date', value: string };
  updatedAt: Date | { __type: 'Date', value: string };
  tags: string[];
  isPinned: boolean;
  isFloating: boolean;
  categoryId?: string;
}

export async function migrateNotesFromLocalStorage() {
  console.log('Checking for notes in localStorage...');
  
  // Check for notes in localStorage
  const notesData = localStorage.getItem('extranuts_notes');
  const backupData = localStorage.getItem('extranuts_emergency_backup');
  
  let notes: OldNote[] = [];
  
  // Try to load from main storage
  if (notesData) {
    try {
      notes = JSON.parse(notesData, (key, value) => {
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      });
      console.log(`Found ${notes.length} notes in main storage`);
    } catch (e) {
      console.error('Failed to parse notes from main storage:', e);
    }
  }
  
  // If no notes found, try backup
  if (notes.length === 0 && backupData) {
    try {
      const backup = JSON.parse(backupData);
      if (backup.notes) {
        notes = backup.notes;
        console.log(`Found ${notes.length} notes in backup storage`);
      }
    } catch (e) {
      console.error('Failed to parse backup data:', e);
    }
  }
  
  if (notes.length === 0) {
    console.log('No notes found in localStorage');
    return 0;
  }
  
  // Migrate each note to the database
  let migrated = 0;
  for (const oldNote of notes) {
    try {
      const request: CreateNoteRequest = {
        title: oldNote.title || 'Untitled Note',
        content: oldNote.content || '',
        category_id: undefined, // Categories not migrated yet
        tags: oldNote.tags || [],
      };
      
      await invoke('create_note', { request });
      migrated++;
      console.log(`Migrated note: ${oldNote.title}`);
    } catch (e) {
      console.error(`Failed to migrate note ${oldNote.title}:`, e);
    }
  }
  
  console.log(`Successfully migrated ${migrated} out of ${notes.length} notes`);
  
  // Mark migration as complete
  localStorage.setItem('extranuts_migration_complete', 'true');
  
  return migrated;
}

export function isMigrationComplete(): boolean {
  return localStorage.getItem('extranuts_migration_complete') === 'true';
}