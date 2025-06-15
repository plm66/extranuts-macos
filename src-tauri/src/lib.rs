// Core modules
mod core;
mod infrastructure;
mod features;

use tauri::Manager;

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

use core::AppState;
use infrastructure::{
    database::{Database, DatabaseConfig},
    database::run_migrations,
    storage::{StoragePaths, StorageLocation},
};
use features::{
    windows::tray::create_tray,
    preferences::PreferencesManager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                let _ = app.set_activation_policy(ActivationPolicy::Regular);
            }
            
            // Initialize preferences
            let prefs_manager = PreferencesManager::new(app.handle());
            let prefs = prefs_manager.load();
            
            // Determine database location based on preferences
            let db_location = if prefs.sync.icloud_sync_enabled {
                StorageLocation::ICloud
            } else {
                StorageLocation::Local
            };
            
            let db_path = StoragePaths::get_database_path(app.handle(), db_location);
            let db_config = DatabaseConfig { path: db_path };
            
            // Initialize database
            let db = Database::new(db_config)
                .expect("Failed to initialize database");
            
            // Run migrations
            run_migrations(&db)
                .expect("Failed to run database migrations");
            
            // Initialize app state
            let app_state = AppState::new(db);
            app.manage(app_state);
            
            // Create system tray
            create_tray(app.handle())?;
            
            // Show main window
            let main_window = app.get_webview_window("main").unwrap();
            main_window.show()?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Window management commands
            features::windows::create_floating_window,
            features::windows::toggle_always_on_top,
            features::windows::show_in_menu_bar,
            
            // Note commands
            features::notes::create_note,
            features::notes::get_note,
            features::notes::search_notes,
            features::notes::get_all_notes,
            features::notes::update_note,
            features::notes::delete_note,
            
            // Sync commands
            features::sync::get_sync_status,
            features::sync::toggle_icloud_sync,
            
            // Preferences commands
            features::preferences::get_preferences,
            features::preferences::update_preferences,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}