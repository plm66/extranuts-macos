import { Component, createSignal, onMount, For, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { categoriesService, type Category, type CategoryPreset } from '../services/categories'

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
}

export const CategoryManager: Component<CategoryManagerProps> = (props) => {
  const [categories, setCategories] = createSignal<Category[]>([])
  const [presets, setPresets] = createSignal<CategoryPreset[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [editingCategory, setEditingCategory] = createSignal<Category | null>(null)
  const [showCreateForm, setShowCreateForm] = createSignal(false)
  const [selectedParent, setSelectedParent] = createSignal<number | null>(null)
  const [error, setError] = createSignal('')

  // Form state
  const [formName, setFormName] = createSignal('')
  const [formColor, setFormColor] = createSignal('#3B82F6')
  const [formParentId, setFormParentId] = createSignal<number | null>(null)

  onMount(async () => {
    await loadCategories()
    await loadPresets()
  })

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const cats = await categoriesService.getHierarchicalCategories()
      setCategories(cats)
    } catch (err) {
      setError('Failed to load categories')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPresets = async () => {
    try {
      const presetList = await categoriesService.getCategoryPresets()
      setPresets(presetList)
    } catch (err) {
      console.error('Failed to load presets:', err)
    }
  }

  const handleCreateCategory = async () => {
    if (!formName().trim()) {
      setError('Category name is required')
      return
    }

    try {
      await categoriesService.createCategory({
        name: formName(),
        color: formColor(),
        parent_id: formParentId()
      })
      await loadCategories()
      resetForm()
      setShowCreateForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create category')
    }
  }

  const handleUpdateCategory = async () => {
    const editing = editingCategory()
    if (!editing || !formName().trim()) return

    try {
      await categoriesService.updateCategory({
        id: editing.id!,
        name: formName(),
        color: formColor(),
        parent_id: formParentId()
      })
      await loadCategories()
      resetForm()
      setEditingCategory(null)
    } catch (err) {
      setError(err.message || 'Failed to update category')
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? This will remove the category from all notes.`)) {
      return
    }

    try {
      await categoriesService.deleteCategory(category.id!)
      await loadCategories()
    } catch (err) {
      setError(err.message || 'Failed to delete category')
    }
  }

  const handleCreateFromPreset = async (preset: CategoryPreset) => {
    try {
      await categoriesService.createFromPreset(preset.name)
      await loadCategories()
    } catch (err) {
      setError(err.message || 'Failed to create category from preset')
    }
  }

  const startEditing = (category: Category) => {
    setEditingCategory(category)
    setFormName(category.name)
    setFormColor(category.color)
    setFormParentId(category.parent_id || null)
    setShowCreateForm(false)
  }

  const startCreating = (parentId?: number) => {
    setSelectedParent(parentId || null)
    setFormParentId(parentId || null)
    setShowCreateForm(true)
    setEditingCategory(null)
    resetForm()
  }

  const resetForm = () => {
    setFormName('')
    setFormColor('#3B82F6')
    setFormParentId(selectedParent())
    setError('')
  }

  const cancelEditing = () => {
    setEditingCategory(null)
    setShowCreateForm(false)
    resetForm()
  }

  const getCategoryIcon = (categoryName: string) => {
    const preset = presets().find(p => p.name === categoryName)
    return preset?.icon || 'material-symbols:folder'
  }

  const renderCategory = (category: Category, depth = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0
    const indentClass = depth > 0 ? `ml-${depth * 4}` : ''

    return (
      <div class={`category-item ${indentClass}`}>
        <div class="flex items-center justify-between p-3 hover:bg-macos-hover rounded-lg transition-colors">
          <div class="flex items-center gap-3">
            {/* Category color dot */}
            <div 
              class="w-4 h-4 rounded-full border border-white/20"
              style={{ backgroundColor: category.color }}
            />
            
            {/* Category icon */}
            <Icon 
              icon={getCategoryIcon(category.name)} 
              class="w-4 h-4 text-macos-text-secondary" 
            />
            
            {/* Category name */}
            <span class="text-sm font-medium">{category.name}</span>
            
            {/* Subcategory count */}
            {hasSubcategories && (
              <span class="text-xs text-macos-text-secondary px-2 py-1 bg-macos-hover rounded">
                {category.subcategories!.length} sub
              </span>
            )}
          </div>
          
          <div class="flex items-center gap-1">
            {/* Add subcategory button */}
            <button
              onClick={() => startCreating(category.id)}
              class="p-1 hover:bg-macos-hover rounded text-macos-text-secondary"
              title="Add subcategory"
            >
              <Icon icon="material-symbols:add" class="w-4 h-4" />
            </button>
            
            {/* Edit button */}
            <button
              onClick={() => startEditing(category)}
              class="p-1 hover:bg-macos-hover rounded text-macos-text-secondary"
              title="Edit category"
            >
              <Icon icon="material-symbols:edit" class="w-4 h-4" />
            </button>
            
            {/* Delete button */}
            <button
              onClick={() => handleDeleteCategory(category)}
              class="p-1 hover:bg-macos-hover rounded text-red-400"
              title="Delete category"
            >
              <Icon icon="material-symbols:delete-outline" class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Render subcategories */}
        {hasSubcategories && (
          <div class="mt-1">
            <For each={category.subcategories}>
              {(subcat) => renderCategory(subcat, depth + 1)}
            </For>
          </div>
        )}
      </div>
    )
  }

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-macos-bg border border-macos-border rounded-xl shadow-2xl w-full max-w-3xl mx-4 h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div class="p-4 border-b border-macos-border">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <Icon icon="material-symbols:category" class="w-5 h-5" />
                Category Manager
              </h2>
              <button
                onClick={props.onClose}
                class="p-2 hover-highlight rounded-lg"
              >
                <Icon icon="material-symbols:close" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="flex-1 flex overflow-hidden">
            {/* Categories List */}
            <div class="flex-1 overflow-y-auto p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium">Your Categories</h3>
                <button
                  onClick={() => startCreating()}
                  class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
                >
                  <Icon icon="material-symbols:add" class="w-4 h-4" />
                  New Category
                </button>
              </div>
              
              {/* Error Display */}
              <Show when={error()}>
                <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p class="text-sm text-red-400">{error()}</p>
                </div>
              </Show>
              
              {/* Loading State */}
              <Show when={isLoading()}>
                <div class="flex items-center justify-center py-8">
                  <Icon icon="material-symbols:sync" class="w-6 h-6 animate-spin" />
                </div>
              </Show>
              
              {/* Categories */}
              <Show when={!isLoading()}>
                <div class="space-y-1">
                  <For each={categories()} fallback={
                    <p class="text-center text-macos-text-secondary py-8">
                      No categories yet. Create one or use a preset below.
                    </p>
                  }>
                    {(category) => renderCategory(category)}
                  </For>
                </div>
              </Show>
            </div>
            
            {/* Sidebar */}
            <div class="w-80 border-l border-macos-border bg-macos-sidebar/50 overflow-y-auto">
              {/* Form Section */}
              <Show when={showCreateForm() || editingCategory()}>
                <div class="p-4 border-b border-macos-border">
                  <h4 class="font-medium mb-3">
                    {editingCategory() ? 'Edit Category' : 'Create Category'}
                  </h4>
                  
                  <div class="space-y-3">
                    {/* Name Input */}
                    <div>
                      <label class="text-xs text-macos-text-secondary">Name</label>
                      <input
                        type="text"
                        value={formName()}
                        onInput={(e) => setFormName(e.target.value)}
                        placeholder="Category name..."
                        class="w-full mt-1 px-3 py-2 bg-macos-hover border border-macos-border rounded text-sm"
                      />
                    </div>
                    
                    {/* Color Input */}
                    <div>
                      <label class="text-xs text-macos-text-secondary">Color</label>
                      <div class="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={formColor()}
                          onInput={(e) => setFormColor(e.target.value)}
                          class="w-8 h-8 rounded border border-macos-border"
                        />
                        <input
                          type="text"
                          value={formColor()}
                          onInput={(e) => setFormColor(e.target.value)}
                          placeholder="#3B82F6"
                          class="flex-1 px-3 py-2 bg-macos-hover border border-macos-border rounded text-sm font-mono"
                        />
                      </div>
                    </div>
                    
                    {/* Parent Category */}
                    <div>
                      <label class="text-xs text-macos-text-secondary">Parent Category (Optional)</label>
                      <select
                        value={formParentId() || ''}
                        onChange={(e) => setFormParentId(e.target.value ? parseInt(e.target.value) : null)}
                        class="w-full mt-1 px-3 py-2 bg-macos-hover border border-macos-border rounded text-sm"
                      >
                        <option value="">No parent (root category)</option>
                        <For each={categories()}>
                          {(cat) => (
                            <option value={cat.id} disabled={cat.id === editingCategory()?.id}>
                              {cat.name}
                            </option>
                          )}
                        </For>
                      </select>
                    </div>
                    
                    {/* Action Buttons */}
                    <div class="flex gap-2 pt-2">
                      <button
                        onClick={editingCategory() ? handleUpdateCategory : handleCreateCategory}
                        class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        {editingCategory() ? 'Update' : 'Create'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        class="px-3 py-2 glass-morphism hover-highlight rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Show>
              
              {/* Presets Section */}
              <div class="p-4">
                <h4 class="font-medium mb-3">Quick Start Presets</h4>
                <p class="text-xs text-macos-text-secondary mb-3">
                  Based on productivity research and color psychology
                </p>
                
                <div class="space-y-2">
                  <For each={presets()}>
                    {(preset) => (
                      <div class="glass-morphism rounded-lg p-3">
                        <div class="flex items-center gap-3 mb-2">
                          <div 
                            class="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: preset.color }}
                          />
                          <Icon icon={preset.icon} class="w-4 h-4" />
                          <span class="text-sm font-medium">{preset.name}</span>
                        </div>
                        <p class="text-xs text-macos-text-secondary mb-2">
                          {preset.description}
                        </p>
                        <button
                          onClick={() => handleCreateFromPreset(preset)}
                          class="w-full px-2 py-1 bg-macos-hover hover:bg-macos-border rounded text-xs"
                        >
                          Add Category
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default CategoryManager