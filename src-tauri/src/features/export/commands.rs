use tauri::State;
use crate::core::AppState;
use super::obsidian::{ObsidianExporter, ExportResult};
use std::path::PathBuf;

#[tauri::command]
pub fn export_to_obsidian(
    state: State<AppState>,
    vault_path: String,
) -> Result<ExportResult, String> {
    // Get all notes from the database
    let service = crate::features::notes::service::NoteService::new(state.db());
    let notes = service.get_all_notes()
        .map_err(|e| format!("Failed to fetch notes: {}", e.message))?;
    
    // Create exporter and export notes
    let exporter = ObsidianExporter::new(PathBuf::from(vault_path))
        .map_err(|e| e.message)?;
    
    exporter.export_notes(notes)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn validate_obsidian_vault(vault_path: String) -> Result<bool, String> {
    let path = PathBuf::from(vault_path);
    
    // Check if path exists and is a directory
    if !path.exists() {
        return Ok(false);
    }
    
    if !path.is_dir() {
        return Ok(false);
    }
    
    // Check if it looks like an Obsidian vault (has .obsidian folder)
    let obsidian_folder = path.join(".obsidian");
    Ok(obsidian_folder.exists() && obsidian_folder.is_dir())
}