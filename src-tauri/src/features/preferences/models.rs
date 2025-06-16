use serde::{Serialize, Deserialize};
use crate::features::sync::SyncSettings;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preferences {
    pub sync: SyncSettings,
    pub window: WindowPreferences,
    pub editor: EditorPreferences,
    pub export: ExportPreferences,
    pub appearance: AppearancePreferences,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPreferences {
    pub default_width: f64,
    pub default_height: f64,
    pub transparency: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditorPreferences {
    pub confirm_delete: bool,
    pub auto_save: bool,
    pub auto_save_interval: u64, // in seconds
    pub font_family: String,
    pub font_size: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportPreferences {
    pub obsidian_vault_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppearancePreferences {
    pub theme: String, // "dark" | "light" | "auto"
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
            editor: EditorPreferences {
                confirm_delete: true,
                auto_save: true,
                auto_save_interval: 30,
                font_family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif".to_string(),
                font_size: 11,
            },
            export: ExportPreferences {
                obsidian_vault_path: None,
            },
            appearance: AppearancePreferences {
                theme: "dark".to_string(),
            },
        }
    }
}