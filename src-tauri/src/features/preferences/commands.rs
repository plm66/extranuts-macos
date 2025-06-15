use tauri::AppHandle;
use super::models::Preferences;
use super::PreferencesManager;

#[tauri::command]
pub fn get_preferences(app_handle: AppHandle) -> Result<Preferences, String> {
    let manager = PreferencesManager::new(&app_handle);
    Ok(manager.load())
}

#[tauri::command]
pub fn update_preferences(
    app_handle: AppHandle,
    preferences: Preferences,
) -> Result<(), String> {
    let manager = PreferencesManager::new(&app_handle);
    manager.save(&preferences)
        .map_err(|e| format!("Failed to save preferences: {:?}", e))
}