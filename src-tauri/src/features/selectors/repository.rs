use rusqlite::{params, OptionalExtension};
use chrono::{DateTime, Utc};
use std::sync::{Arc, Mutex};
use crate::infrastructure::database::Database;
use crate::core::error::{AppError, AppResult};
use super::models::*;

pub struct SelectorRepository {
    db: Arc<Mutex<Database>>,
}

impl SelectorRepository {
    pub fn new(db: Arc<Mutex<Database>>) -> Self {
        Self { db }
    }
    
    pub fn create_selector(&self, request: &CreateSelectorRequest) -> AppResult<Selector> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        let now = Utc::now();
        
        // Insert with specific ID (billiard ball number)
        conn.execute(
            "INSERT INTO selectors (id, name, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4)",
            params![
                request.id,
                request.name,
                now.to_rfc3339(),
                now.to_rfc3339()
            ],
        ).map_err(|e| AppError::new("SELECTOR_CREATE_ERROR", e.to_string()))?;
        
        Ok(Selector {
            id: request.id,
            name: request.name.clone(),
            created_at: now,
            updated_at: now,
        })
    }
    
    pub fn get_selector(&self, id: i64) -> AppResult<Option<Selector>> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, created_at, updated_at 
             FROM selectors WHERE id = ?1"
        )?;
        
        let selector = stmt.query_row(params![id], |row| {
            Ok(Selector {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                    .unwrap()
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                    .unwrap()
                    .with_timezone(&Utc),
            })
        }).optional()?;
        
        Ok(selector)
    }
    
    pub fn get_all_selectors(&self) -> AppResult<Vec<Selector>> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, created_at, updated_at 
             FROM selectors ORDER BY id"
        )?;
        
        let selector_iter = stmt.query_map([], |row| {
            Ok(Selector {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                    .unwrap()
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                    .unwrap()
                    .with_timezone(&Utc),
            })
        })?;
        
        let mut selectors = Vec::new();
        for selector in selector_iter {
            selectors.push(selector?);
        }
        
        Ok(selectors)
    }
    
    pub fn update_selector_name(&self, request: &UpdateSelectorRequest) -> AppResult<()> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        let now = Utc::now();
        
        // Try to update first
        let rows_affected = conn.execute(
            "UPDATE selectors SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![request.name, now.to_rfc3339(), request.id],
        )?;
        
        // If no rows were updated, insert a new record
        if rows_affected == 0 {
            conn.execute(
                "INSERT INTO selectors (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
                params![request.id, request.name, now.to_rfc3339(), now.to_rfc3339()],
            )?;
        }
        
        Ok(())
    }
    
    pub fn delete_selector(&self, id: i64) -> AppResult<()> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let rows_affected = conn.execute(
            "DELETE FROM selectors WHERE id = ?1",
            params![id],
        )?;
        
        if rows_affected == 0 {
            return Err(AppError::new("SELECTOR_NOT_FOUND", format!("Selector with id {} not found", id)));
        }
        
        Ok(())
    }
    
    pub fn selector_exists(&self, id: i64) -> AppResult<bool> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM selectors WHERE id = ?1",
            params![id],
            |row| row.get(0)
        )?;
        
        Ok(count > 0)
    }
}