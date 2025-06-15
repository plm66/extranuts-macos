import { invoke } from '@tauri-apps/api/core'

export interface Category {
  id?: number
  name: string
  color: string
  parent_id?: number
  created_at: string
  subcategories?: Category[]
}

export interface CreateCategoryRequest {
  name: string
  color: string
  parent_id?: number
}

export interface UpdateCategoryRequest {
  id: number
  name: string
  color: string
  parent_id?: number
}

export interface CategoryPreset {
  name: string
  color: string
  description: string
  icon: string
}

export const categoriesService = {
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    return await invoke<Category>('create_category', { request })
  },

  async getCategory(id: number): Promise<Category | null> {
    return await invoke<Category | null>('get_category', { id })
  },

  async getAllCategories(): Promise<Category[]> {
    return await invoke<Category[]>('get_all_categories')
  },

  async getHierarchicalCategories(): Promise<Category[]> {
    return await invoke<Category[]>('get_hierarchical_categories')
  },

  async updateCategory(request: UpdateCategoryRequest): Promise<Category> {
    return await invoke<Category>('update_category', { request })
  },

  async deleteCategory(id: number): Promise<void> {
    await invoke('delete_category', { id })
  },

  async getCategoryPresets(): Promise<CategoryPreset[]> {
    return await invoke<CategoryPreset[]>('get_category_presets')
  },

  async createFromPreset(presetName: string): Promise<Category> {
    return await invoke<Category>('create_category_from_preset', { presetName })
  }
}