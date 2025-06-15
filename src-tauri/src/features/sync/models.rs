use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncSettings {
    pub icloud_sync_enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncStatus {
    pub enabled: bool,
    pub location: String,
    pub last_sync: Option<String>,
}