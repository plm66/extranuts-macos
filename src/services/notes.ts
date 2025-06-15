import { invoke } from '@tauri-apps/api/core';
import type { Note as BackendNote, CreateNoteRequest, UpdateNoteRequest, SearchOptions } from '../types/models';
import type { Note as FrontendNote } from '../types';

// Convert backend note to frontend note format
function convertNote(backendNote: BackendNote): FrontendNote {
  return {
    id: backendNote.id?.toString() || '',
    title: backendNote.title,
    content: backendNote.content,
    createdAt: new Date(backendNote.created_at),
    updatedAt: new Date(backendNote.updated_at),
    categoryId: backendNote.category_id?.toString(),
    tags: backendNote.tags.map(t => t.name),
    isPinned: backendNote.is_pinned,
    isFloating: false, // Will be managed by frontend
  };
}

export const notesService = {
  async createNote(title: string, content: string = ''): Promise<FrontendNote> {
    const request: CreateNoteRequest = {
      title,
      content,
      category_id: undefined,
      tags: [],
    };
    const backendNote = await invoke<BackendNote>('create_note', { request });
    return convertNote(backendNote);
  },

  async getNote(id: string): Promise<FrontendNote | null> {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return null;
    
    const backendNote = await invoke<BackendNote | null>('get_note', { id: numericId });
    return backendNote ? convertNote(backendNote) : null;
  },

  async searchNotes(query: string = ''): Promise<FrontendNote[]> {
    const options: SearchOptions = {
      query,
      category_id: undefined,
      tags: undefined,
      limit: undefined,
      offset: undefined,
    };
    const backendNotes = await invoke<BackendNote[]>('search_notes', { options });
    return backendNotes.map(convertNote);
  },

  async getAllNotes(): Promise<FrontendNote[]> {
    const backendNotes = await invoke<BackendNote[]>('get_all_notes');
    return backendNotes.map(convertNote);
  },
  
  async updateNote(id: string, updates: Partial<FrontendNote>): Promise<void> {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return;
    
    // Get the current note to have all fields
    const currentNote = await this.getNote(id);
    if (!currentNote) return;
    
    const request: UpdateNoteRequest = {
      id: numericId,
      title: updates.title ?? currentNote.title,
      content: updates.content ?? currentNote.content,
      category_id: updates.categoryId ? parseInt(updates.categoryId) : undefined,
      tags: [], // Tags not implemented yet
      is_pinned: updates.isPinned ?? currentNote.isPinned,
    };
    
    await invoke('update_note', { request });
  },
  
  async deleteNote(id: string): Promise<void> {
    console.log('notesService.deleteNote called with id:', id);
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      console.error('Invalid note ID:', id);
      return;
    }
    
    console.log('Invoking delete_note with numericId:', numericId);
    try {
      await invoke('delete_note', { id: numericId });
      console.log('delete_note command completed successfully');
    } catch (error) {
      console.error('delete_note command failed:', error);
      throw error;
    }
  }
};

export const syncService = {
  async getSyncStatus(): Promise<boolean> {
    return await invoke<boolean>('get_sync_status');
  },

  async toggleICloudSync(enabled: boolean): Promise<string> {
    return await invoke<string>('toggle_icloud_sync', { enabled });
  },
};