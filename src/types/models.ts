export interface Note {
  id?: number;
  title: string;
  content: string;
  category_id?: number;
  selector_id?: number;
  is_pinned: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id?: number;
  name: string;
  color?: string;
  created_at: string;
}

export interface Tag {
  id?: number;
  name: string;
  created_at: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  category_id?: number;
  selector_id?: number;
  tags: string[];
}

export interface UpdateNoteRequest {
  id: number;
  title: string;
  content: string;
  category_id?: number;
  selector_id?: number;
  tags: string[];
  is_pinned: boolean;
}

export interface SearchOptions {
  query: string;
  category_id?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface SyncSettings {
  icloud_sync_enabled: boolean;
}