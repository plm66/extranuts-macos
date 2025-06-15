use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone)]
pub enum StorageLocation {
    Local,
    ICloud,
}

pub struct StoragePaths;

impl StoragePaths {
    pub fn get_database_path(
        app_handle: &tauri::AppHandle,
        location: StorageLocation,
    ) -> PathBuf {
        match location {
            StorageLocation::Local => {
                let app_dir = app_handle.path().app_data_dir()
                    .expect("Failed to get app data dir");
                app_dir.join("extranuts.db")
            }
            StorageLocation::ICloud => {
                let home = app_handle.path().home_dir()
                    .expect("Failed to get home directory");
                
                home.join("Library")
                    .join("Mobile Documents")
                    .join("iCloud~com~extranuts~app")
                    .join("Documents")
                    .join("extranuts.db")
            }
        }
    }
    
    pub fn get_preferences_path(app_handle: &tauri::AppHandle) -> PathBuf {
        let app_dir = app_handle.path().app_data_dir()
            .expect("Failed to get app data dir");
        app_dir.join("preferences.json")
    }
}