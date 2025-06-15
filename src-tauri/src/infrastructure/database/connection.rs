use rusqlite::{Connection, Result};
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub path: PathBuf,
}

pub struct Database {
    conn: Connection,
    config: DatabaseConfig,
}

impl Database {
    pub fn new(config: DatabaseConfig) -> Result<Self> {
        // Ensure directory exists
        if let Some(parent) = config.path.parent() {
            std::fs::create_dir_all(parent).expect("Failed to create database directory");
        }
        
        let conn = Connection::open(&config.path)?;
        
        // Optimize for performance
        conn.execute_batch("
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA cache_size = -64000;
            PRAGMA mmap_size = 268435456;
            PRAGMA temp_store = MEMORY;
            PRAGMA foreign_keys = ON;
        ")?;
        
        Ok(Database { conn, config })
    }
    
    pub fn connection(&self) -> &Connection {
        &self.conn
    }
    
    pub fn path(&self) -> &PathBuf {
        &self.config.path
    }
}