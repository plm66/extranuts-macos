import { Component, createSignal, For, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { preferences, updatePreferences } from '../stores/preferencesStore'
import { exportService } from '../services/export'
import { themeStore } from '../stores/themeStore'

interface SettingSection {
  id: string
  title: string
  icon: string
  description: string
}

const sections: SettingSection[] = [
  {
    id: 'editor',
    title: 'Editor',
    icon: 'material-symbols:edit-note',
    description: 'Customize your writing experience'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: 'material-symbols:palette-outline',
    description: 'Visual preferences and themes'
  },
  {
    id: 'sync',
    title: 'Sync & Backup',
    icon: 'material-symbols:sync',
    description: 'Cloud synchronization and data backup'
  },
  {
    id: 'export',
    title: 'Export & Import',
    icon: 'material-symbols:import-export',
    description: 'Export notes to other applications'
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    icon: 'material-symbols:keyboard',
    description: 'Quick actions and navigation'
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: 'material-symbols:settings-applications',
    description: 'Power user settings'
  }
]

export const SettingsPanel: Component<{
  onClose: () => void
}> = (props) => {
  const [selectedSection, setSelectedSection] = createSignal<string>('editor')
  const [wikiLinksExpanded, setWikiLinksExpanded] = createSignal(false)
  const [categoriesExpanded, setCategoriesExpanded] = createSignal(false)
  
  const getCurrentSection = () => sections.find(s => s.id === selectedSection())
  
  const ToggleSwitch: Component<{
    checked: boolean
    onChange: () => void
    label: string
  }> = (switchProps) => (
    <button
      onClick={switchProps.onChange}
      class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        switchProps.checked ? 'bg-blue-600' : 'bg-gray-600'
      }`}
      aria-label={switchProps.label}
    >
      <span
        class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          switchProps.checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
  
  const SettingItem: Component<{
    title: string
    description: string
    children: any
  }> = (itemProps) => (
    <div class="glass-morphism rounded-lg p-4">
      <div class="flex items-start justify-between">
        <div class="flex-1 mr-4">
          <h4 class="text-sm font-medium">{itemProps.title}</h4>
          <p class="text-xs text-macos-text-secondary mt-1">
            {itemProps.description}
          </p>
        </div>
        <div class="flex-shrink-0">
          {itemProps.children}
        </div>
      </div>
    </div>
  )
  
  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-macos-bg border border-macos-border rounded-xl shadow-2xl w-full max-w-4xl mx-4 h-[600px] overflow-hidden flex flex-col">
        {/* Header */}
        <div class="p-4 border-b border-macos-border">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Settings</h2>
            <button
              onClick={props.onClose}
              class="p-2 hover-highlight rounded-lg"
              aria-label="Close settings"
            >
              <Icon icon="material-symbols:close" class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Two-panel layout */}
        <div class="flex-1 flex overflow-hidden">
          {/* Left sidebar navigation */}
          <div class="w-64 border-r border-macos-border bg-macos-sidebar/50 overflow-y-auto">
            <nav class="p-2">
              <For each={sections}>
                {(section) => (
                  <button
                    onClick={() => setSelectedSection(section.id)}
                    class={`w-full text-left p-3 rounded-lg mb-1 transition-all ${
                      selectedSection() === section.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'hover:bg-macos-hover'
                    }`}
                  >
                    <div class="flex items-center gap-3">
                      <Icon 
                        icon={section.icon} 
                        class={`w-5 h-5 ${
                          selectedSection() === section.id ? 'text-blue-400' : 'text-macos-text-secondary'
                        }`}
                      />
                      <span class="font-medium text-sm">{section.title}</span>
                    </div>
                  </button>
                )}
              </For>
            </nav>
          </div>
          
          {/* Right content area */}
          <div class="flex-1 overflow-y-auto">
            <div class="p-6">
              {/* Breadcrumb */}
              <div class="mb-6">
                <div class="flex items-center gap-2 text-sm text-macos-text-secondary">
                  <button 
                    onClick={() => {}} 
                    class="hover:text-macos-text transition-colors flex items-center gap-1"
                  >
                    <Icon icon="material-symbols:settings" class="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <Icon icon="material-symbols:chevron-right" class="w-4 h-4" />
                  <span class="text-macos-text">{getCurrentSection()?.title}</span>
                </div>
                <h3 class="text-xl font-semibold mt-2">{getCurrentSection()?.title}</h3>
                <p class="text-sm text-macos-text-secondary mt-1">{getCurrentSection()?.description}</p>
              </div>
              
              {/* Section content */}
              <div class="space-y-4">
                {/* Editor Settings */}
                <Show when={selectedSection() === 'editor'}>
                  <SettingItem
                    title="Delete Confirmation"
                    description="Show a confirmation dialog before deleting notes. Turn off for faster workflow if you're confident with deletions."
                  >
                    <ToggleSwitch
                      checked={preferences().editor.confirm_delete}
                      onChange={async () => {
                        await updatePreferences({
                          editor: {
                            ...preferences().editor,
                            confirm_delete: !preferences().editor.confirm_delete
                          }
                        })
                      }}
                      label="Delete confirmation"
                    />
                  </SettingItem>
                  
                  <SettingItem
                    title="Auto-save"
                    description="Automatically save your notes as you type. Disabling this requires manual saving with Cmd+S."
                  >
                    <ToggleSwitch
                      checked={preferences().editor.auto_save}
                      onChange={async () => {
                        await updatePreferences({
                          editor: {
                            ...preferences().editor,
                            auto_save: !preferences().editor.auto_save
                          }
                        })
                      }}
                      label="Auto-save"
                    />
                  </SettingItem>
                  
                  <SettingItem
                    title="Auto-save Interval"
                    description="How often to save changes when auto-save is enabled."
                  >
                    <select
                      value={preferences().editor.auto_save_interval}
                      onChange={async (e) => {
                        await updatePreferences({
                          editor: {
                            ...preferences().editor,
                            auto_save_interval: parseInt(e.target.value)
                          }
                        })
                      }}
                      class="px-3 py-1 bg-macos-hover border border-macos-border rounded text-sm"
                      disabled={!preferences().editor.auto_save}
                    >
                      <option value="10">10 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="120">2 minutes</option>
                    </select>
                  </SettingItem>
                  
                  <SettingItem
                    title="Editor Font Family"
                    description="Choose the font family for the note editor. Monospace fonts are great for coding notes."
                  >
                    <select
                      value={preferences().editor.font_family}
                      onChange={async (e) => {
                        await updatePreferences({
                          editor: {
                            ...preferences().editor,
                            font_family: e.target.value
                          }
                        })
                      }}
                      class="px-3 py-1 bg-macos-hover border border-macos-border rounded text-sm w-48"
                    >
                      <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System Font (San Francisco)</option>
                      <option value="Monaco, 'Cascadia Code', 'SF Mono', Consolas, monospace">Monaco (Monospace)</option>
                      <option value="Menlo, Monaco, 'Lucida Console', monospace">Menlo (Monospace)</option>
                      <option value="'SF Mono', Monaco, 'Cascadia Code', monospace">'SF Mono' (Monospace)</option>
                      <option value="Consolas, 'Courier New', monospace">Consolas (Monospace)</option>
                      <option value="'Courier New', Courier, monospace">Courier New (Monospace)</option>
                      <option value="Helvetica, Arial, sans-serif">Helvetica (Sans-serif)</option>
                      <option value="Arial, sans-serif">Arial (Sans-serif)</option>
                      <option value="Georgia, 'Times New Roman', serif">Georgia (Serif)</option>
                      <option value="'Times New Roman', Times, serif">Times New Roman (Serif)</option>
                    </select>
                  </SettingItem>
                  
                  <SettingItem
                    title="Editor Font Size"
                    description="Adjust the font size for the note editor. Larger sizes are easier to read, smaller sizes show more content."
                  >
                    <div class="flex items-center gap-3">
                      <input
                        type="range"
                        min="8"
                        max="24"
                        step="1"
                        value={preferences().editor.font_size}
                        onInput={async (e) => {
                          await updatePreferences({
                            editor: {
                              ...preferences().editor,
                              font_size: parseInt(e.target.value)
                            }
                          })
                        }}
                        class="w-24"
                      />
                      <span class="text-xs text-macos-text-secondary w-10">
                        {preferences().editor.font_size}px
                      </span>
                    </div>
                  </SettingItem>
                  
                  {/* WikiLinks Documentation */}
                  <div class="glass-morphism rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <button
                      onClick={() => setWikiLinksExpanded(!wikiLinksExpanded())}
                      class="w-full p-4 flex items-center justify-between hover:bg-blue-500/20 transition-colors"
                    >
                      <div class="flex items-center gap-3">
                        <Icon icon="material-symbols:link" class="w-5 h-5 text-blue-400" />
                        <div class="text-left">
                          <h4 class="text-sm font-medium text-blue-400">WikiLinks - Connect Your Notes</h4>
                          <p class="text-xs text-blue-300">
                            Create connections using [[Note Title]] syntax
                          </p>
                        </div>
                      </div>
                      <Icon 
                        icon={wikiLinksExpanded() ? "material-symbols:expand-less" : "material-symbols:expand-more"} 
                        class="w-5 h-5 text-blue-400" 
                      />
                    </button>
                    
                    <Show when={wikiLinksExpanded()}>
                      <div class="px-4 pb-4 border-t border-blue-500/30">
                        <div class="space-y-3 pt-3">
                          <div>
                            <h5 class="text-xs font-medium text-blue-300 mb-2">How to Create Links:</h5>
                            <ul class="text-xs text-blue-200 space-y-1 ml-2">
                              <li>• Type <code class="bg-blue-900/30 px-1 rounded">[[Note Title]]</code> to link to existing notes</li>
                              <li>• Type <code class="bg-blue-900/30 px-1 rounded">[[New Note]]</code> to create and link to new notes</li>
                              <li>• Use <code class="bg-blue-900/30 px-1 rounded">[[Note Title|Display Text]]</code> for custom link text</li>
                            </ul>
                          </div>
                          <div>
                            <h5 class="text-xs font-medium text-blue-300 mb-2">Features:</h5>
                            <ul class="text-xs text-blue-200 space-y-1 ml-2">
                              <li>• <strong>Auto-complete:</strong> Start typing a link to see matching notes</li>
                              <li>• <strong>Preview mode:</strong> Click the preview button to see clickable links</li>
                              <li>• <strong>Smart creation:</strong> Links to non-existent notes create them automatically</li>
                              <li>• <strong>Visual indicators:</strong> Existing links appear in blue, missing ones in red</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Show>
                  </div>
                  
                  {/* Categories Documentation */}
                  <div class="glass-morphism rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <button
                      onClick={() => setCategoriesExpanded(!categoriesExpanded())}
                      class="w-full p-4 flex items-center justify-between hover:bg-purple-500/20 transition-colors"
                    >
                      <div class="flex items-center gap-3">
                        <Icon icon="material-symbols:category" class="w-5 h-5 text-purple-400" />
                        <div class="text-left">
                          <h4 class="text-sm font-medium text-purple-400">Categories - Organize Your Notes</h4>
                          <p class="text-xs text-purple-300">
                            Unlimited hierarchical categories with visual indicators
                          </p>
                        </div>
                      </div>
                      <Icon 
                        icon={categoriesExpanded() ? "material-symbols:expand-less" : "material-symbols:expand-more"} 
                        class="w-5 h-5 text-purple-400" 
                      />
                    </button>
                    
                    <Show when={categoriesExpanded()}>
                      <div class="px-4 pb-4 border-t border-purple-500/30">
                        <div class="space-y-3 pt-3">
                          <div>
                            <h5 class="text-xs font-medium text-purple-300 mb-2">How to Use Categories:</h5>
                            <ul class="text-xs text-purple-200 space-y-1 ml-2">
                              <li>• Click the <Icon icon="material-symbols:category" class="w-3 h-3 inline" /> icon in the note toolbar to assign categories</li>
                              <li>• Click "Categories" in the main header to manage all categories</li>
                              <li>• Double-click category names to rename them quickly</li>
                              <li>• Create unlimited sub-categories for detailed organization</li>
                            </ul>
                          </div>
                          <div>
                            <h5 class="text-xs font-medium text-purple-300 mb-2">Features:</h5>
                            <ul class="text-xs text-purple-200 space-y-1 ml-2">
                              <li>• <strong>Visual indicators:</strong> Color dots and labels in the note list</li>
                              <li>• <strong>Quick presets:</strong> Projects, Ideas, Research, Important, Draft, Archive</li>
                              <li>• <strong>Hierarchical structure:</strong> Create sub-categories within categories</li>
                              <li>• <strong>Color coding:</strong> Assign unique colors based on psychology research</li>
                            </ul>
                          </div>
                          <div>
                            <h5 class="text-xs font-medium text-purple-300 mb-2">Quick Actions:</h5>
                            <ul class="text-xs text-purple-200 space-y-1 ml-2">
                              <li>• <strong>Create:</strong> Use presets or create custom categories</li>
                              <li>• <strong>Rename:</strong> Double-click category names for inline editing</li>
                              <li>• <strong>Organize:</strong> Drag or use forms to create sub-categories</li>
                              <li>• <strong>Delete:</strong> Remove categories with confirmation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Show>
                  </div>
                </Show>
                
                {/* Appearance Settings */}
                <Show when={selectedSection() === 'appearance'}>
                  <SettingItem
                    title="Theme"
                    description="Choose your preferred theme. Auto mode follows your system preference."
                  >
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <input
                          type="radio"
                          id="theme-dark"
                          name="theme"
                          value="dark"
                          checked={themeStore.theme() === 'dark'}
                          onChange={async () => await themeStore.setTheme('dark')}
                          class="w-4 h-4 text-blue-600"
                        />
                        <label for="theme-dark" class="text-sm flex items-center gap-2">
                          <Icon icon="material-symbols:dark-mode" class="w-4 h-4" />
                          Dark Theme
                        </label>
                      </div>
                      <div class="flex items-center gap-2">
                        <input
                          type="radio"
                          id="theme-light"
                          name="theme"
                          value="light"
                          checked={themeStore.theme() === 'light'}
                          onChange={async () => await themeStore.setTheme('light')}
                          class="w-4 h-4 text-blue-600"
                        />
                        <label for="theme-light" class="text-sm flex items-center gap-2">
                          <Icon icon="material-symbols:light-mode" class="w-4 h-4" />
                          Light Theme
                        </label>
                      </div>
                      <div class="flex items-center gap-2">
                        <input
                          type="radio"
                          id="theme-auto"
                          name="theme"
                          value="auto"
                          checked={themeStore.theme() === 'auto'}
                          onChange={async () => await themeStore.setTheme('auto')}
                          class="w-4 h-4 text-blue-600"
                        />
                        <label for="theme-auto" class="text-sm flex items-center gap-2">
                          <Icon icon="material-symbols:brightness-auto" class="w-4 h-4" />
                          Auto (System)
                        </label>
                      </div>
                    </div>
                  </SettingItem>
                  
                  <SettingItem
                    title="Window Transparency"
                    description="Adjust the transparency level of the application window for a more integrated desktop experience."
                  >
                    <div class="flex items-center gap-3">
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.05"
                        value={preferences().window.transparency}
                        onInput={async (e) => {
                          await updatePreferences({
                            window: {
                              ...preferences().window,
                              transparency: parseFloat(e.target.value)
                            }
                          })
                        }}
                        class="w-24"
                      />
                      <span class="text-xs text-macos-text-secondary w-10">
                        {Math.round(preferences().window.transparency * 100)}%
                      </span>
                    </div>
                  </SettingItem>
                  
                  <div class="glass-morphism rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                    <div class="flex items-start gap-3">
                      <Icon icon="material-symbols:info" class="w-5 h-5 mt-0.5 text-blue-400" />
                      <div>
                        <h4 class="text-sm font-medium text-blue-400 mb-1">Theme Information</h4>
                        <ul class="text-xs text-blue-300 space-y-1">
                          <li>• <strong>Dark Theme:</strong> Low-light environment, easier on the eyes</li>
                          <li>• <strong>Light Theme:</strong> Bright environment, high contrast</li>
                          <li>• <strong>Auto Mode:</strong> Follows macOS system preference automatically</li>
                          <li>• <strong>Theme changes:</strong> Applied instantly and saved to preferences</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Show>
                
                {/* Sync Settings */}
                <Show when={selectedSection() === 'sync'}>
                  <SettingItem
                    title="iCloud Sync"
                    description="Sync your notes across all your Apple devices using iCloud. Your notes will be available on all devices signed in with the same Apple ID."
                  >
                    <ToggleSwitch
                      checked={preferences().sync.icloud_sync_enabled}
                      onChange={async () => {
                        await updatePreferences({
                          sync: {
                            ...preferences().sync,
                            icloud_sync_enabled: !preferences().sync.icloud_sync_enabled
                          }
                        })
                      }}
                      label="iCloud sync"
                    />
                  </SettingItem>
                  
                  <div class="glass-morphism rounded-lg p-4 bg-blue-500/10 border border-blue-500/30">
                    <div class="flex items-start gap-3">
                      <Icon icon="material-symbols:cloud-sync" class="w-5 h-5 mt-0.5 text-blue-400" />
                      <div>
                        <h4 class="text-sm font-medium text-blue-400 mb-1">How iCloud Sync Works</h4>
                        <ul class="text-xs text-blue-300 space-y-1">
                          <li>• Notes are stored in your iCloud Drive</li>
                          <li>• Changes sync automatically when online</li>
                          <li>• Available on all devices with same Apple ID</li>
                          <li>• End-to-end encrypted by Apple</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Show>
                
                {/* Export Settings */}
                <Show when={selectedSection() === 'export'}>
                  <SettingItem
                    title="Obsidian Vault Location"
                    description="Select the folder where your Obsidian vault is located. Your notes will be exported to a timestamped folder within this vault."
                  >
                    <div class="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          console.log('Selecting Obsidian vault...')
                          const path = await exportService.selectObsidianVault()
                          console.log('Selected path:', path)
                          if (path) {
                            console.log('Validating vault...')
                            const isValid = await exportService.validateObsidianVault(path)
                            console.log('Vault is valid:', isValid)
                            if (isValid) {
                              console.log('Updating preferences with path:', path)
                              await updatePreferences({
                                export: {
                                  ...preferences().export,
                                  obsidian_vault_path: path
                                }
                              })
                              console.log('Preferences updated, new preferences:', preferences())
                            } else {
                              alert('The selected folder does not appear to be an Obsidian vault. Please select a folder that contains a .obsidian directory.')
                            }
                          }
                        }}
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Select Vault
                      </button>
                      {preferences().export.obsidian_vault_path && (
                        <button
                          onClick={async () => {
                            await updatePreferences({
                              export: {
                                ...preferences().export,
                                obsidian_vault_path: null
                              }
                            })
                          }}
                          class="p-1 hover-highlight rounded"
                          title="Clear vault path"
                        >
                          <Icon icon="material-symbols:close" class="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </SettingItem>
                  
                  <Show when={preferences().export.obsidian_vault_path}>
                    <div class="glass-morphism rounded-lg p-4">
                      <div class="flex items-start gap-3">
                        <Icon icon="material-symbols:folder-open" class="w-5 h-5 mt-0.5 text-green-400" />
                        <div class="flex-1">
                          <h4 class="text-sm font-medium mb-1">Current Vault Path</h4>
                          <p class="text-xs text-macos-text-secondary font-mono break-all">
                            {preferences().export.obsidian_vault_path}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Show>
                  
                  <div class="glass-morphism rounded-lg p-4 bg-purple-500/10 border border-purple-500/30">
                    <div class="flex items-start gap-3">
                      <Icon icon="simple-icons:obsidian" class="w-5 h-5 mt-0.5 text-purple-400" />
                      <div>
                        <h4 class="text-sm font-medium text-purple-400 mb-1">About Obsidian Export</h4>
                        <ul class="text-xs text-purple-300 space-y-1">
                          <li>• Each export creates a timestamped folder</li>
                          <li>• Notes include frontmatter with metadata</li>
                          <li>• Wikilinks are preserved in [[note]] format</li>
                          <li>• Tags and creation dates are included</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Show>
                
                {/* Shortcuts */}
                <Show when={selectedSection() === 'shortcuts'}>
                  <div class="glass-morphism rounded-lg p-4 bg-green-500/10 border border-green-500/30">
                    <div class="flex items-center gap-3 mb-4">
                      <Icon icon="material-symbols:keyboard" class="w-5 h-5 text-green-400" />
                      <h4 class="text-sm font-medium text-green-400">Native macOS Shortcuts</h4>
                    </div>
                    <p class="text-xs text-green-300 mb-4">
                      Extranuts uses standard macOS shortcuts that work across all applications. No custom shortcuts to remember!
                    </p>
                    
                    <div class="space-y-3">
                      <div>
                        <h5 class="text-xs font-medium text-green-300 mb-2">File Operations</h5>
                        <div class="grid grid-cols-2 gap-2">
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">New Note</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘N</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Save Note</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘S</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Close Window</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘W</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Quit App</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘Q</kbd>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 class="text-xs font-medium text-green-300 mb-2">Text Editing</h5>
                        <div class="grid grid-cols-2 gap-2">
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Select All</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘A</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Copy</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘C</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Paste</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘V</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Undo</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘Z</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Redo</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘⇧Z</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Find</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘F</kbd>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 class="text-xs font-medium text-green-300 mb-2">Application</h5>
                        <div class="grid grid-cols-2 gap-2">
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Settings</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘,</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Hide App</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘H</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Minimize</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌘M</kbd>
                          </div>
                          <div class="flex justify-between items-center p-2 bg-green-900/20 rounded">
                            <span class="text-xs">Enter/Exit Full Screen</span>
                            <kbd class="text-xs bg-green-900/30 px-2 py-1 rounded font-mono">⌃⌘F</kbd>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="glass-morphism rounded-lg p-4 bg-blue-500/10 border border-blue-500/30">
                    <div class="flex items-start gap-3">
                      <Icon icon="material-symbols:info" class="w-5 h-5 mt-0.5 text-blue-400" />
                      <div>
                        <h4 class="text-sm font-medium text-blue-400 mb-1">Mouse-Centric Design</h4>
                        <p class="text-xs text-blue-300">
                          Extranuts is designed for thinking with your mouse. Every action has a clear button or arrow - 
                          use shortcuts only when convenient, never required.
                        </p>
                      </div>
                    </div>
                  </div>
                </Show>
                
                {/* Advanced Settings */}
                <Show when={selectedSection() === 'advanced'}>
                  <div class="glass-morphism rounded-lg p-4 bg-yellow-500/10 border border-yellow-500/30">
                    <div class="flex items-start gap-3">
                      <Icon icon="material-symbols:warning-outline" class="w-5 h-5 mt-0.5 text-yellow-400" />
                      <div>
                        <h4 class="text-sm font-medium text-yellow-400 mb-1">Caution</h4>
                        <p class="text-xs text-yellow-300">
                          Advanced settings can affect app performance and behavior. 
                          Only modify these if you understand the implications.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="glass-morphism rounded-lg p-4 text-center">
                    <Icon icon="material-symbols:settings-applications" class="w-12 h-12 mx-auto mb-2 text-macos-text-secondary" />
                    <p class="text-sm text-macos-text-secondary">
                      Advanced options will be added as needed
                    </p>
                    <p class="text-xs text-macos-text-secondary mt-1">
                      Including database management, export options, and developer tools
                    </p>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div class="p-4 border-t border-macos-border bg-macos-sidebar/50">
          <div class="flex items-center justify-between">
            <p class="text-xs text-macos-text-secondary">
              Extranuts v1.0.0 • Settings are saved automatically
            </p>
            <div class="flex items-center gap-2">
              <button
                onClick={() => window.open('https://github.com/your-repo/extranuts/issues', '_blank')}
                class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Report Issue
              </button>
              <span class="text-macos-text-secondary">•</span>
              <button
                onClick={() => window.open('https://github.com/your-repo/extranuts/wiki', '_blank')}
                class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel