use std::sync::{Arc, Mutex};
use crate::infrastructure::database::Database;

pub struct AppState {
    pub db: Arc<Mutex<Database>>,
}

impl AppState {
    pub fn new(db: Database) -> Self {
        Self {
            db: Arc::new(Mutex::new(db)),
        }
    }
    
    pub fn db(&self) -> Arc<Mutex<Database>> {
        Arc::clone(&self.db)
    }
}