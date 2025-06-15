use serde::{Serialize, Deserialize};
use crate::features::sync::SyncSettings;

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