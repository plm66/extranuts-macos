use tauri::{State, AppHandle};
use crate::core::AppState;
use super::service::SyncService;

#[tauri::command]
pub fn get_sync_status(
    app: AppHandle,
) -> Result<bool, String> {
    let service = SyncService::new(app);
    service.get_sync_status()
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn toggle_icloud_sync(
    app: AppHandle,
    state: State<AppState>,
    enabled: bool,
) -> Result<String, String> {
    let service = SyncService::new(app);
    let current_db = state.db();
    
    match service.toggle_icloud_sync(enabled, current_db) {
        Ok((message, new_db)) => {
            // Replace the database in the app state
            *state.db.lock().unwrap() = new_db;
            Ok(message)
        }
        Err(e) => Err(e.message)
    }
}