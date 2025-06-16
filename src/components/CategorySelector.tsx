import { Component, createSignal, onMount, For, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { categoriesService, type Category } from '../services/categories'

interface CategorySelectorProps {
  selectedCategoryId?: string
  onCategoryChange: (categoryId: string | undefined) => void
  compact?: boolean
  onCreateCategory?: () => void
}

export const CategorySelector: Component<CategorySelectorProps> = (props) => {
  const [categories, setCategories] = createSignal<Category[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [isOpen, setIsOpen] = createSignal(false)

  onMount(async () => {
    await loadCategories()
  })

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const cats = await categoriesService.getHierarchicalCategories()
      setCategories(cats)
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategorySelect = (categoryId: number | undefined) => {
    props.onCategoryChange(categoryId?.toString())
    setIsOpen(false)
  }

  const selectedCategory = () => {
    if (!props.selectedCategoryId) return null
    const findCategory = (cats: Category[]): Category | null => {
      for (const cat of cats) {
        if (cat.id?.toString() === props.selectedCategoryId) return cat
        if (cat.subcategories) {
          const found = findCategory(cat.subcategories)
          if (found) return found
        }
      }
      return null
    }
    return findCategory(categories())
  }

  const renderCategoryOption = (category: Category, depth = 0) => {
    const indentClass = depth > 0 ? `ml-${depth * 3}` : ''
    const hasSubcategories = category.subcategories && category.subcategories.length > 0

    return (
      <>
        <div
          class={`flex items-center gap-2 p-2 hover:bg-[var(--theme-bg-hover)] cursor-pointer ${indentClass}`}
          onClick={() => handleCategorySelect(category.id)}
        >
          <div 
            class="w-3 h-3 rounded-full border border-[var(--theme-category-border)]"
            style={{ backgroundColor: category.color }}
          />
          <span class="text-sm">{category.name}</span>
          {hasSubcategories && (
            <span class="text-xs text-[var(--theme-text-secondary)]">
              ({category.subcategories!.length})
            </span>
          )}
        </div>
        {hasSubcategories && (
          <For each={category.subcategories}>
            {(subcat) => renderCategoryOption(subcat, depth + 1)}
          </For>
        )}
      </>
    )
  }

  return (
    <div class="relative">
      <button
        onClick={() => setIsOpen(!isOpen())}
        class={`flex items-center gap-2 hover-highlight rounded ${
          props.compact 
            ? 'p-1.5 text-xs' 
            : 'p-2 text-sm'
        } border border-[var(--theme-border-primary)] bg-[var(--theme-bg-hover)]`}
      >
        <Show 
          when={selectedCategory()} 
          fallback={
            <>
              <Icon icon="material-symbols:category-outline" class="w-4 h-4 text-[var(--theme-text-secondary)]" />
              <span class="text-[var(--theme-text-secondary)]">No category</span>
            </>
          }
        >
          <div 
            class="w-3 h-3 rounded-full border border-[var(--theme-category-border)]"
            style={{ backgroundColor: selectedCategory()!.color }}
          />
          <span>{selectedCategory()!.name}</span>
        </Show>
        <Icon 
          icon={isOpen() ? "material-symbols:expand-less" : "material-symbols:expand-more"} 
          class="w-4 h-4 ml-auto" 
        />
      </button>

      <Show when={isOpen()}>
        <div class="absolute z-50 mt-1 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] rounded-lg shadow-xl min-w-48 max-h-64 overflow-y-auto">
          {/* No category option */}
          <div
            class="flex items-center gap-2 p-2 hover:bg-[var(--theme-bg-hover)] cursor-pointer border-b border-[var(--theme-border-primary)]"
            onClick={() => handleCategorySelect(undefined)}
          >
            <Icon icon="material-symbols:category-outline" class="w-3 h-3 text-[var(--theme-text-secondary)]" />
            <span class="text-sm text-[var(--theme-text-secondary)]">No category</span>
          </div>

          <Show when={isLoading()}>
            <div class="p-4 text-center">
              <Icon icon="material-symbols:sync" class="w-4 h-4 animate-spin" />
            </div>
          </Show>

          <Show when={!isLoading()}>
            <For each={categories()} fallback={
              <div class="p-4 text-center text-[var(--theme-text-secondary)] text-xs">
                No categories available
              </div>
            }>
              {(category) => renderCategoryOption(category)}
            </For>
            
            {/* Create new category button */}
            <Show when={props.onCreateCategory}>
              <div class="border-t border-[var(--theme-border-primary)] mt-1 pt-1">
                <button
                  class="w-full flex items-center gap-2 p-2 hover:bg-[var(--theme-bg-hover)] text-left text-sm text-blue-400"
                  onClick={() => {
                    props.onCreateCategory?.()
                    setIsOpen(false)
                  }}
                >
                  <Icon icon="material-symbols:add-circle-outline" class="w-4 h-4" />
                  Create new category
                </button>
              </div>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default CategorySelector