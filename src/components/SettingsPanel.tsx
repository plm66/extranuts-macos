import { Component, createSignal, For, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { preferences, updatePreferences } from '../stores/preferencesStore'

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
                </Show>
                
                {/* Appearance Settings */}
                <Show when={selectedSection() === 'appearance'}>
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
                  
                  <div class="glass-morphism rounded-lg p-4 text-center">
                    <Icon icon="material-symbols:palette-outline" class="w-12 h-12 mx-auto mb-2 text-macos-text-secondary" />
                    <p class="text-sm text-macos-text-secondary">
                      More appearance options coming soon
                    </p>
                    <p class="text-xs text-macos-text-secondary mt-1">
                      Including themes, font sizes, and color schemes
                    </p>
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
                
                {/* Shortcuts */}
                <Show when={selectedSection() === 'shortcuts'}>
                  <div class="glass-morphism rounded-lg p-4">
                    <h4 class="text-sm font-medium mb-3">Available Shortcuts</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <div class="flex justify-between items-center p-2 bg-macos-hover/50 rounded">
                        <span class="text-sm text-macos-text-secondary">New Note</span>
                        <kbd class="text-xs bg-macos-bg px-2 py-1 rounded font-mono">⌘N</kbd>
                      </div>
                      <div class="flex justify-between items-center p-2 bg-macos-hover/50 rounded">
                        <span class="text-sm text-macos-text-secondary">Save Note</span>
                        <kbd class="text-xs bg-macos-bg px-2 py-1 rounded font-mono">⌘S</kbd>
                      </div>
                      <div class="flex justify-between items-center p-2 bg-macos-hover/50 rounded">
                        <span class="text-sm text-macos-text-secondary">Delete Note</span>
                        <kbd class="text-xs bg-macos-bg px-2 py-1 rounded font-mono">⌘⌫</kbd>
                      </div>
                      <div class="flex justify-between items-center p-2 bg-macos-hover/50 rounded">
                        <span class="text-sm text-macos-text-secondary">Search Notes</span>
                        <kbd class="text-xs bg-macos-bg px-2 py-1 rounded font-mono">⌘F</kbd>
                      </div>
                      <div class="flex justify-between items-center p-2 bg-macos-hover/50 rounded">
                        <span class="text-sm text-macos-text-secondary">Toggle Preview</span>
                        <kbd class="text-xs bg-macos-bg px-2 py-1 rounded font-mono">⌘⇧P</kbd>
                      </div>
                      <div class="flex justify-between items-center p-2 bg-macos-hover/50 rounded">
                        <span class="text-sm text-macos-text-secondary">Settings</span>
                        <kbd class="text-xs bg-macos-bg px-2 py-1 rounded font-mono">⌘,</kbd>
                      </div>
                    </div>
                  </div>
                  
                  <div class="glass-morphism rounded-lg p-4 text-center">
                    <Icon icon="material-symbols:keyboard" class="w-12 h-12 mx-auto mb-2 text-macos-text-secondary" />
                    <p class="text-sm text-macos-text-secondary">
                      Custom keyboard shortcuts coming soon
                    </p>
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