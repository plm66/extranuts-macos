use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use crate::database::SyncSettings;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preferences {
    pub sync: SyncSettings,
    pub window: WindowPreferences,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPreferences {
    pub default_width: f64,
    pub default_height: f64,
    pub transparency: f64,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            sync: SyncSettings {
                icloud_sync_enabled: false,
            },
            window: WindowPreferences {
                default_width: 400.0,
                default_height: 300.0,
                transparency: 0.85,
            },
        }
    }
}

pub struct PreferencesManager {
    path: PathBuf,
}

impl PreferencesManager {
    pub fn new(app_handle: &tauri::AppHandle) -> Self {
        let app_dir = app_handle.path().app_data_dir()
            .expect("Failed to get app data dir");
        
        std::fs::create_dir_all(&app_dir).expect("Failed to create app dir");
        
        Self {
            path: app_dir.join("preferences.json"),
        }
    }
    
    pub fn load(&self) -> Preferences {
        match fs::read_to_string(&self.path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Preferences::default(),
        }
    }
    
    pub fn save(&self, prefs: &Preferences) -> Result<(), String> {
        let json = serde_json::to_string_pretty(prefs)
            .map_err(|e| e.to_string())?;
        
        fs::write(&self.path, json)
            .map_err(|e| e.to_string())?;
        
        Ok(())
    }
}