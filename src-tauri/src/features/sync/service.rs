use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use crate::core::error::{AppError, AppResult};
use crate::infrastructure::{
    database::{Database, DatabaseConfig},
    storage::{StoragePaths, StorageLocation},
};
use crate::features::preferences::PreferencesManager;

pub struct SyncService {
    app_handle: AppHandle,
    prefs_manager: PreferencesManager,
}

impl SyncService {
    pub fn new(app_handle: AppHandle) -> Self {
        let prefs_manager = PreferencesManager::new(&app_handle);
        Self {
            app_handle,
            prefs_manager,
        }
    }
    
    pub fn get_sync_status(&self) -> AppResult<bool> {
        let prefs = self.prefs_manager.load();
        Ok(prefs.sync.icloud_sync_enabled)
    }
    
    pub fn toggle_icloud_sync(
        &self,
        enabled: bool,
        current_db: Arc<Mutex<Database>>,
    ) -> AppResult<(String, Database)> {
        let mut prefs = self.prefs_manager.load();
        
        if prefs.sync.icloud_sync_enabled == enabled {
            return Err(AppError::new("NO_CHANGE", "Sync setting already at requested state"));
        }
        
        // Update preferences
        prefs.sync.icloud_sync_enabled = enabled;
        self.prefs_manager.save(&prefs)?;
        
        // Get paths
        let old_path = {
            let db = current_db.lock().unwrap();
            db.path().clone()
        };
        
        let new_location = if enabled {
            StorageLocation::ICloud
        } else {
            StorageLocation::Local
        };
        
        let new_path = StoragePaths::get_database_path(&self.app_handle, new_location);
        
        // If paths are different, copy the database
        if old_path != new_path {
            self.migrate_database(&old_path, &new_path)?;
        }
        
        // Create new database connection
        let new_config = DatabaseConfig { path: new_path };
        let new_db = Database::new(new_config)?;
        
        let message = format!("iCloud sync {}", if enabled { "enabled" } else { "disabled" });
        Ok((message, new_db))
    }
    
    fn migrate_database(&self, from: &PathBuf, to: &PathBuf) -> AppResult<()> {
        if from.exists() {
            // Ensure target directory exists
            if let Some(parent) = to.parent() {
                std::fs::create_dir_all(parent)
                    .map_err(|e| AppError::new("DIR_CREATE_ERROR", e.to_string()))?;
            }
            
            // Copy main database file
            std::fs::copy(from, to)
                .map_err(|e| AppError::new("FILE_COPY_ERROR", 
                    format!("Failed to copy database: {}", e)))?;
            
            // Copy WAL and SHM files if they exist
            let wal_from = from.with_extension("db-wal");
            let shm_from = from.with_extension("db-shm");
            
            if wal_from.exists() {
                let wal_to = to.with_extension("db-wal");
                std::fs::copy(&wal_from, &wal_to).ok();
            }
            
            if shm_from.exists() {
                let shm_to = to.with_extension("db-shm");
                std::fs::copy(&shm_from, &shm_to).ok();
            }
        }
        
        Ok(())
    }
}