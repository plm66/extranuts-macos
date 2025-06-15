use std::sync::{Arc, Mutex};
use rusqlite::{params, Row};
use chrono::{DateTime, Utc};
use crate::core::error::{AppResult, AppError};
use crate::infrastructure::database::Database;
use super::models::{Category, CreateCategoryRequest, UpdateCategoryRequest};

pub struct CategoryRepository {
    db: Arc<Mutex<Database>>,
}

impl CategoryRepository {
    pub fn new(db: Arc<Mutex<Database>>) -> Self {
        Self { db }
    }

    pub fn create_category(&self, request: CreateCategoryRequest) -> AppResult<Category> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let now = Utc::now();
        
        let _id = conn.execute(
            "INSERT INTO categories (name, color, parent_id, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![request.name, request.color, request.parent_id, now.to_rfc3339()],
        ).map_err(|e| AppError::new("DATABASE_ERROR", e.to_string()))?;
        
        Ok(Category {
            id: Some(conn.last_insert_rowid()),
            name: request.name,
            color: request.color,
            parent_id: request.parent_id,
            created_at: now,
            subcategories: None,
        })
    }

    pub fn get_category(&self, id: i64) -> AppResult<Option<Category>> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, color, parent_id, created_at FROM categories WHERE id = ?1"
        ).map_err(|e| AppError::new("DATABASE_ERROR", e.to_string()))?;
        
        let result = stmt.query_row(params![id], |row| {
            Ok(self.map_row(row)?)
        });
        
        match result {
            Ok(category) => Ok(Some(category)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(AppError::new("DATABASE_ERROR", e.to_string())),
        }
    }

    pub fn get_all_categories(&self) -> AppResult<Vec<Category>> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, color, parent_id, created_at FROM categories ORDER BY name ASC"
        ).map_err(|e| AppError::new("DATABASE_ERROR", e.to_string()))?;
        
        let category_iter = stmt.query_map([], |row| {
            Ok(self.map_row(row)?)
        }).map_err(|e| AppError::new("DATABASE_ERROR", e.to_string()))?;
        
        let mut categories = Vec::new();
        for category in category_iter {
            categories.push(category.map_err(|e| AppError::new("DATABASE_ERROR", e.to_string()))?);
        }
        
        Ok(categories)
    }

    pub fn update_category(&self, request: UpdateCategoryRequest) -> AppResult<Category> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        conn.execute(
            "UPDATE categories SET name = ?1, color = ?2, parent_id = ?3 WHERE id = ?4",
            params![request.name, request.color, request.parent_id, request.id],
        ).map_err(|e| AppError::new("DATABASE_ERROR", e.to_string()))?;
        
        self.get_category(request.id)?
            .ok_or_else(|| AppError::new("NOT_FOUND", "Category not found after update"))
    }

    pub fn delete_category(&self, id: i64) -> AppResult<()> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let tx = conn.unchecked_transaction()
            .map_err(|e| AppError::new("TRANSACTION_ERROR", e.to_string()))?;
        
        // Set category_id to NULL for all notes with this category
        tx.execute(
            "UPDATE notes SET category_id = NULL WHERE category_id = ?1",
            params![id],
        )?;
        
        // Delete the category
        tx.execute(
            "DELETE FROM categories WHERE id = ?1",
            params![id],
        )?;
        
        tx.commit()?;
        Ok(())
    }

    fn map_row(&self, row: &Row) -> rusqlite::Result<Category> {
        let created_at_str: String = row.get(4)?;
        let created_at = DateTime::parse_from_rfc3339(&created_at_str)
            .map_err(|_e| rusqlite::Error::InvalidColumnType(4, "created_at".to_string(), rusqlite::types::Type::Text))?
            .with_timezone(&Utc);
        
        Ok(Category {
            id: Some(row.get(0)?),
            name: row.get(1)?,
            color: row.get(2)?,
            parent_id: row.get(3)?,
            created_at,
            subcategories: None,
        })
    }
    
    pub fn get_hierarchical_categories(&self) -> AppResult<Vec<Category>> {
        let all_categories = self.get_all_categories()?;
        let mut root_categories = Vec::new();
        let mut category_map = std::collections::HashMap::new();
        
        // Create a map of all categories
        for category in &all_categories {
            if let Some(id) = category.id {
                category_map.insert(id, category.clone());
            }
        }
        
        // Build hierarchy
        for category in all_categories {
            if category.parent_id.is_none() {
                // This is a root category
                let mut root_cat = category.clone();
                root_cat.subcategories = Some(self.get_subcategories(category.id.unwrap(), &category_map)?);
                root_categories.push(root_cat);
            }
        }
        
        Ok(root_categories)
    }
    
    fn get_subcategories(
        &self, 
        parent_id: i64, 
        category_map: &std::collections::HashMap<i64, Category>
    ) -> AppResult<Vec<Category>> {
        let mut subcategories = Vec::new();
        
        for (_, category) in category_map {
            if category.parent_id == Some(parent_id) {
                let mut subcat = category.clone();
                if let Some(sub_id) = subcat.id {
                    subcat.subcategories = Some(self.get_subcategories(sub_id, category_map)?);
                }
                subcategories.push(subcat);
            }
        }
        
        // Sort by name
        subcategories.sort_by(|a, b| a.name.cmp(&b.name));
        Ok(subcategories)
    }
}