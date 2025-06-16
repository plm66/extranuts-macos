use rusqlite::{params, params_from_iter, OptionalExtension, Result as SqlResult};
use chrono::{DateTime, Utc};
use std::sync::{Arc, Mutex};
use crate::infrastructure::database::Database;
use crate::core::error::{AppError, AppResult};
use super::models::*;

pub struct NoteRepository {
    db: Arc<Mutex<Database>>,
}

impl NoteRepository {
    pub fn new(db: Arc<Mutex<Database>>) -> Self {
        Self { db }
    }
    
    pub fn create_note(&self, request: &CreateNoteRequest) -> AppResult<Note> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        let now = Utc::now();
        
        let tx = conn.unchecked_transaction()
            .map_err(|e| AppError::new("TRANSACTION_ERROR", e.to_string()))?;
        
        tx.execute(
            "INSERT INTO notes (title, content, category_id, is_pinned, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                request.title,
                request.content,
                request.category_id,
                0, // is_pinned default to false
                now.to_rfc3339(),
                now.to_rfc3339()
            ],
        )?;
        
        let note_id = tx.last_insert_rowid();
        
        // Skip tags for now
        
        tx.commit()?;
        
        // Return a simple note object without fetching from DB
        Ok(Note {
            id: Some(note_id),
            title: request.title.clone(),
            content: request.content.clone(),
            category_id: request.category_id,
            is_pinned: false,
            tags: vec![],
            created_at: now,
            updated_at: now,
        })
    }
    
    pub fn get_note(&self, id: i64) -> AppResult<Option<Note>> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let mut stmt = conn.prepare(
            "SELECT id, title, content, category_id, is_pinned, created_at, updated_at 
             FROM notes WHERE id = ?1"
        )?;
        
        let note = stmt.query_row(params![id], |row| {
            Ok(Note {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                content: row.get(2)?,
                category_id: row.get(3)?,
                is_pinned: row.get::<_, i32>(4)? != 0,
                tags: vec![],
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(5)?)
                    .unwrap()
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                    .unwrap()
                    .with_timezone(&Utc),
            })
        }).optional()?;
        
        if let Some(note) = note {
            // Temporairement, on skip les tags
            // note.tags = self.get_note_tags(note.id.unwrap())?;
            Ok(Some(note))
        } else {
            Ok(None)
        }
    }
    
    pub fn search_notes(&self, options: &SearchOptions) -> AppResult<Vec<Note>> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let mut query = String::from(
            "SELECT DISTINCT n.id, n.title, n.content, n.category_id, n.is_pinned, 
                    n.created_at, n.updated_at
             FROM notes n"
        );
        
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![];
        let mut where_clauses: Vec<String> = vec![];
        
        // Full-text search
        if !options.query.is_empty() {
            query.push_str(" JOIN notes_fts ON n.id = notes_fts.rowid");
            where_clauses.push("notes_fts MATCH ?".to_string());
            params.push(Box::new(options.query.clone()));
        }
        
        // Category filter
        if let Some(cat_id) = options.category_id {
            where_clauses.push("n.category_id = ?".to_string());
            params.push(Box::new(cat_id));
        }
        
        // Tags filter
        if let Some(ref tags) = options.tags {
            if !tags.is_empty() {
                query.push_str(" JOIN note_tags nt ON n.id = nt.note_id");
                query.push_str(" JOIN tags t ON nt.tag_id = t.id");
                let placeholders = tags.iter().map(|_| "?").collect::<Vec<_>>().join(",");
                where_clauses.push(format!("t.name IN ({})", placeholders));
                for tag in tags {
                    params.push(Box::new(tag.clone()));
                }
            }
        }
        
        if !where_clauses.is_empty() {
            query.push_str(" WHERE ");
            query.push_str(&where_clauses.join(" AND "));
        }
        
        query.push_str(" ORDER BY n.is_pinned DESC, n.updated_at DESC");
        
        if let Some(limit) = options.limit {
            query.push_str(&format!(" LIMIT {}", limit));
            if let Some(offset) = options.offset {
                query.push_str(&format!(" OFFSET {}", offset));
            }
        }
        
        let mut stmt = conn.prepare(&query)?;
        
        let notes = stmt.query_map(params_from_iter(params.iter()), |row| {
            Ok(Note {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                content: row.get(2)?,
                category_id: row.get(3)?,
                is_pinned: row.get::<_, i32>(4)? != 0,
                tags: vec![],
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(5)?)
                    .unwrap()
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                    .unwrap()
                    .with_timezone(&Utc),
            })
        })?
        .collect::<SqlResult<Vec<_>>>()?;
        
        // Pour l'instant, sautons la récupération des tags
        Ok(notes)
    }
    
    pub fn update_note(&self, request: &UpdateNoteRequest) -> AppResult<Note> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        let now = Utc::now();
        
        conn.execute(
            "UPDATE notes SET title = ?1, content = ?2, category_id = ?3, is_pinned = ?4, updated_at = ?5 
             WHERE id = ?6",
            params![
                request.title,
                request.content,
                request.category_id,
                if request.is_pinned { 1 } else { 0 },
                now.to_rfc3339(),
                request.id
            ],
        )?;
        
        // Pour l'instant, on retourne juste la note mise à jour
        Ok(Note {
            id: Some(request.id),
            title: request.title.clone(),
            content: request.content.clone(),
            category_id: request.category_id,
            is_pinned: request.is_pinned,
            tags: vec![], // On skip les tags pour l'instant
            created_at: now, // Pas idéal mais ok pour l'instant
            updated_at: now,
        })
    }
    
    pub fn delete_note(&self, id: i64) -> AppResult<()> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        // Commencer une transaction
        let tx = conn.unchecked_transaction()
            .map_err(|e| AppError::new("TRANSACTION_ERROR", e.to_string()))?;
        
        // Supprimer d'abord les tags associés
        tx.execute(
            "DELETE FROM note_tags WHERE note_id = ?1",
            params![id],
        )?;
        
        // Supprimer la note
        tx.execute(
            "DELETE FROM notes WHERE id = ?1",
            params![id],
        )?;
        
        tx.commit()?;
        
        Ok(())
    }
    
    #[allow(dead_code)]
    fn get_or_create_tag(&self, tx: &rusqlite::Transaction, name: &str) -> AppResult<i64> {
        let existing: Option<i64> = tx.query_row(
            "SELECT id FROM tags WHERE name = ?1",
            params![name],
            |row| row.get(0)
        ).optional()?;
        
        match existing {
            Some(id) => Ok(id),
            None => {
                tx.execute(
                    "INSERT INTO tags (name) VALUES (?1)",
                    params![name],
                )?;
                Ok(tx.last_insert_rowid())
            }
        }
    }
    
    #[allow(dead_code)]
    fn get_note_tags(&self, note_id: i64) -> AppResult<Vec<Tag>> {
        let db = self.db.lock().unwrap();
        let conn = db.connection();
        
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.created_at 
             FROM tags t 
             JOIN note_tags nt ON t.id = nt.tag_id 
             WHERE nt.note_id = ?1"
        )?;
        
        let tags = stmt.query_map(params![note_id], |row| {
            Ok(Tag {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                    .unwrap()
                    .with_timezone(&Utc),
            })
        })?
        .collect::<SqlResult<Vec<_>>>()?;
        
        Ok(tags)
    }
}