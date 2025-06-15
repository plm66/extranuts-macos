use std::fs;
use std::path::PathBuf;
use crate::core::error::{AppError, AppResult};
use crate::infrastructure::storage::StoragePaths;
use super::models::Preferences;

pub struct PreferencesManager {
    path: PathBuf,
}

impl PreferencesManager {
    pub fn new(app_handle: &tauri::AppHandle) -> Self {
        let path = StoragePaths::get_preferences_path(app_handle);
        
        // Ensure directory exists
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).ok();
        }
        
        Self { path }
    }
    
    pub fn load(&self) -> Preferences {
        match fs::read_to_string(&self.path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Preferences::default(),
        }
    }
    
    pub fn save(&self, prefs: &Preferences) -> AppResult<()> {
        let json = serde_json::to_string_pretty(prefs)?;
        
        fs::write(&self.path, json)
            .map_err(|e| AppError::new("PREFS_SAVE_ERROR", e.to_string()))?;
        
        Ok(())
    }
}