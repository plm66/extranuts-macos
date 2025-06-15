import { Component, createSignal, Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'
import { exportService } from '../services/export'
import { preferences } from '../stores/preferencesStore'
import { notes, selectedNote } from '../stores/noteStore'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ExportModal: Component<ExportModalProps> = (props) => {
  const [isExporting, setIsExporting] = createSignal(false)
  const [exportResult, setExportResult] = createSignal<any>(null)
  const [error, setError] = createSignal<string>('')
  const [exportMode, setExportMode] = createSignal<'all' | 'current'>('all')
  const [targetFolder, setTargetFolder] = createSignal<string>('')
  
  const handleExport = async () => {
    const vaultPath = preferences().export.obsidian_vault_path
    console.log('Export triggered, vault path:', vaultPath)
    console.log('Full preferences:', preferences())
    
    if (!vaultPath) {
      setError('Please select an Obsidian vault in Settings > Export & Import first.')
      return
    }

    // Determine which notes to export
    let noteIds: string[] | undefined = undefined
    if (exportMode() === 'current') {
      const current = selectedNote()
      if (!current) {
        setError('No note is currently selected.')
        return
      }
      noteIds = [current.id]
    }
    
    setIsExporting(true)
    setError('')
    setExportResult(null)
    
    try {
      const result = await exportService.exportToObsidian(vaultPath, noteIds, targetFolder() || undefined)
      setExportResult(result)
    } catch (err) {
      setError(err.message || 'Failed to export notes')
    } finally {
      setIsExporting(false)
    }
  }
  
  const reset = () => {
    setExportResult(null)
    setError('')
  }
  
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-macos-bg border border-macos-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          {/* Header */}
          <div class="p-4 border-b border-macos-border">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <Icon icon="simple-icons:obsidian" class="w-5 h-5 text-purple-400" />
                Export to Obsidian
              </h2>
              <button
                onClick={() => {
                  props.onClose()
                  reset()
                }}
                class="p-2 hover-highlight rounded-lg"
                disabled={isExporting()}
              >
                <Icon icon="material-symbols:close" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div class="p-6">
            <Show 
              when={!exportResult()}
              fallback={
                <div class="space-y-4">
                  <div class="text-center">
                    <Icon icon="material-symbols:check-circle" class="w-16 h-16 text-green-400 mx-auto mb-3" />
                    <h3 class="text-lg font-semibold mb-2">Export Successful!</h3>
                  </div>
                  
                  <div class="glass-morphism rounded-lg p-4 space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-macos-text-secondary">Total Notes:</span>
                      <span>{exportResult().total_notes}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-macos-text-secondary">Successfully Exported:</span>
                      <span class="text-green-400">{exportResult().successful_exports}</span>
                    </div>
                    <Show when={exportResult().failed_exports.length > 0}>
                      <div class="flex justify-between text-sm">
                        <span class="text-macos-text-secondary">Failed:</span>
                        <span class="text-red-400">{exportResult().failed_exports.length}</span>
                      </div>
                    </Show>
                  </div>
                  
                  <div class="glass-morphism rounded-lg p-3">
                    <p class="text-xs text-macos-text-secondary mb-1">Exported to:</p>
                    <p class="text-xs font-mono break-all">{exportResult().export_path}</p>
                  </div>
                  
                  <Show when={exportResult().failed_exports.length > 0}>
                    <details class="glass-morphism rounded-lg p-3">
                      <summary class="text-sm cursor-pointer">Failed exports ({exportResult().failed_exports.length})</summary>
                      <div class="mt-2 space-y-1">
                        {exportResult().failed_exports.map(([title, error]) => (
                          <div class="text-xs">
                            <span class="text-red-400">{title}:</span>
                            <span class="text-macos-text-secondary ml-1">{error}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </Show>
                  
                  <button
                    onClick={() => {
                      props.onClose()
                      reset()
                    }}
                    class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Done
                  </button>
                </div>
              }
            >
              <div class="space-y-4">
                <Show when={!preferences().export.obsidian_vault_path}>
                  <div class="glass-morphism rounded-lg p-4 bg-yellow-500/10 border border-yellow-500/30">
                    <div class="flex items-start gap-3">
                      <Icon icon="material-symbols:warning-outline" class="w-5 h-5 mt-0.5 text-yellow-400" />
                      <div>
                        <h4 class="text-sm font-medium text-yellow-400 mb-1">No Vault Selected</h4>
                        <p class="text-xs text-yellow-300">
                          Please select your Obsidian vault in Settings → Export & Import first.
                        </p>
                      </div>
                    </div>
                  </div>
                </Show>
                
                <Show when={preferences().export.obsidian_vault_path}>
                  <div class="space-y-4">
                    {/* Export Mode Selection */}
                    <div class="glass-morphism rounded-lg p-4">
                      <h4 class="text-sm font-medium mb-3">What to Export</h4>
                      <div class="space-y-2">
                        <label class="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="exportMode"
                            checked={exportMode() === 'all'}
                            onChange={() => setExportMode('all')}
                            class="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div class="text-sm font-medium">All Notes</div>
                            <div class="text-xs text-macos-text-secondary">
                              Export all {notes().length} notes from your collection
                            </div>
                          </div>
                        </label>
                        
                        <label class="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="exportMode"
                            checked={exportMode() === 'current'}
                            onChange={() => setExportMode('current')}
                            class="w-4 h-4 text-blue-600"
                            disabled={!selectedNote()}
                          />
                          <div class={selectedNote() ? '' : 'opacity-50'}>
                            <div class="text-sm font-medium">Current Note Only</div>
                            <div class="text-xs text-macos-text-secondary">
                              {selectedNote() 
                                ? `Export "${selectedNote()?.title}"` 
                                : 'No note selected'}
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {/* Target Folder Selection */}
                    <div class="glass-morphism rounded-lg p-4">
                      <h4 class="text-sm font-medium mb-3">Export Location</h4>
                      <div class="space-y-2">
                        <label class="text-xs text-macos-text-secondary">
                          Folder within vault (optional)
                        </label>
                        <input
                          type="text"
                          value={targetFolder()}
                          onInput={(e) => setTargetFolder(e.target.value)}
                          placeholder="e.g., Imports, Notes, Daily Notes"
                          class="w-full px-3 py-2 bg-macos-hover border border-macos-border rounded text-sm placeholder-macos-text-secondary/50"
                        />
                        <p class="text-xs text-macos-text-secondary">
                          Leave empty to export to vault root. If folder doesn't exist, it will be created.
                        </p>
                      </div>
                    </div>
                    
                    <div class="glass-morphism rounded-lg p-4">
                      <h4 class="text-sm font-medium mb-2">Export Information</h4>
                      <div class="space-y-2 text-xs text-macos-text-secondary">
                        <div class="flex items-center gap-2">
                          <Icon icon="material-symbols:note" class="w-4 h-4" />
                          <span>
                            {exportMode() === 'all' 
                              ? `${notes().length} notes will be exported`
                              : selectedNote() 
                                ? '1 note will be exported'
                                : 'No notes selected'
                            }
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <Icon icon="material-symbols:folder" class="w-4 h-4" />
                          <span class="truncate">
                            To: {preferences().export.obsidian_vault_path}
                            {targetFolder() && `/${targetFolder()}`}
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <Icon icon="material-symbols:calendar-today" class="w-4 h-4" />
                          <span>Timestamped folder will be created</span>
                        </div>
                      </div>
                    </div>
                    
                    <Show when={error()}>
                      <div class="glass-morphism rounded-lg p-3 bg-red-500/10 border border-red-500/30">
                        <p class="text-sm text-red-400">{error()}</p>
                      </div>
                    </Show>
                    
                    <div class="flex gap-3">
                      <button
                        onClick={() => {
                          props.onClose()
                          reset()
                        }}
                        class="flex-1 px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm"
                        disabled={isExporting()}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExport}
                        disabled={isExporting()}
                        class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Show when={isExporting()} fallback={<>Export Now</>}>
                          <Icon icon="material-symbols:sync" class="w-4 h-4 animate-spin" />
                          <span>Exporting...</span>
                        </Show>
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default ExportModal