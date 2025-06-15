use rusqlite::{Connection, Result, params, params_from_iter, OptionalExtension};
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use tauri::Manager;

pub struct Database {
    conn: Connection,
    db_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncSettings {
    pub icloud_sync_enabled: bool,
}

impl Database {
    pub fn new(app_handle: &tauri::AppHandle, sync_settings: &SyncSettings) -> Result<Self> {
        let db_path = Self::get_database_path(app_handle, sync_settings.icloud_sync_enabled);
        
        // Ensure directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).expect("Failed to create database directory");
        }
        
        let conn = Connection::open(&db_path)?;
        
        // Optimize for performance with 10k+ notes
        conn.execute_batch("
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA cache_size = -64000;
            PRAGMA mmap_size = 268435456;
            PRAGMA temp_store = MEMORY;
            PRAGMA foreign_keys = ON;
        ")?;
        
        let mut db = Database { conn, db_path };
        db.init_schema()?;
        Ok(db)
    }
    
    fn get_database_path(app_handle: &tauri::AppHandle, use_icloud: bool) -> PathBuf {
        if use_icloud {
            // iCloud Drive container path
            // Format: ~/Library/Mobile Documents/iCloud~com~extranuts~app/Documents/
            let home = app_handle.path().home_dir()
                .expect("Failed to get home directory");
            
            // Use reverse domain notation for iCloud container
            let icloud_container = home
                .join("Library")
                .join("Mobile Documents")
                .join("iCloud~com~extranuts~app")
                .join("Documents");
            
            icloud_container.join("extranuts.db")
        } else {
            // Local app data directory
            let app_dir = app_handle.path().app_data_dir()
                .expect("Failed to get app data dir");
            
            app_dir.join("extranuts.db")
        }
    }
    
    pub fn get_path(&self) -> &PathBuf {
        &self.db_path
    }
    
    fn init_schema(&mut self) -> Result<()> {
        self.conn.execute_batch("
            -- Categories table
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                color TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Notes table
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                category_id INTEGER,
                is_pinned INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            );
            
            -- Tags table
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Note-Tag junction table
            CREATE TABLE IF NOT EXISTS note_tags (
                note_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                PRIMARY KEY (note_id, tag_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );
            
            -- FTS5 virtual table for full-text search
            CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
                title, 
                content,
                content=notes,
                content_rowid=id,
                tokenize='porter unicode61'
            );
            
            -- Triggers to keep FTS index updated
            CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes
            BEGIN
                INSERT INTO notes_fts(rowid, title, content) 
                VALUES (new.id, new.title, new.content);
            END;
            
            CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes
            BEGIN
                UPDATE notes_fts 
                SET title = new.title, content = new.content 
                WHERE rowid = new.id;
            END;
            
            CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes
            BEGIN
                DELETE FROM notes_fts WHERE rowid = old.id;
            END;
            
            -- Indexes for performance
            CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id);
            CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned DESC, updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_note_tags_note ON note_tags(note_id);
            CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);
        ")?;
        
        Ok(())
    }
    
    // Note operations
    pub fn create_note(&self, request: &crate::models::CreateNoteRequest) -> Result<crate::models::Note> {
        let now = Utc::now();
        let tx = self.conn.unchecked_transaction()?;
        
        tx.execute(
            "INSERT INTO notes (title, content, category_id, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                request.title,
                request.content,
                request.category_id,
                now.to_rfc3339(),
                now.to_rfc3339()
            ],
        )?;
        
        let note_id = tx.last_insert_rowid();
        
        // Handle tags
        for tag_name in &request.tags {
            let tag_id = self.get_or_create_tag(&tx, tag_name)?;
            tx.execute(
                "INSERT INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
                params![note_id, tag_id],
            )?;
        }
        
        tx.commit()?;
        
        self.get_note(note_id).map(|n| n.unwrap())
    }
    
    pub fn get_note(&self, id: i64) -> Result<Option<crate::models::Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, content, category_id, is_pinned, created_at, updated_at 
             FROM notes WHERE id = ?1"
        )?;
        
        let note = stmt.query_row(params![id], |row| {
            Ok(crate::models::Note {
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
        
        if let Some(mut note) = note {
            note.tags = self.get_note_tags(note.id.unwrap())?;
            Ok(Some(note))
        } else {
            Ok(None)
        }
    }
    
    pub fn search_notes(&self, options: &crate::models::SearchOptions) -> Result<Vec<crate::models::Note>> {
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
        
        let mut stmt = self.conn.prepare(&query)?;
        
        let notes = stmt.query_map(params_from_iter(params.iter()), |row| {
            Ok(crate::models::Note {
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
        .collect::<Result<Vec<_>>>()?;
        
        // Fetch tags for each note
        let mut results = vec![];
        for mut note in notes {
            note.tags = self.get_note_tags(note.id.unwrap())?;
            results.push(note);
        }
        
        Ok(results)
    }
    
    fn get_or_create_tag(&self, tx: &rusqlite::Transaction, name: &str) -> Result<i64> {
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
    
    fn get_note_tags(&self, note_id: i64) -> Result<Vec<crate::models::Tag>> {
        let mut stmt = self.conn.prepare(
            "SELECT t.id, t.name, t.created_at 
             FROM tags t 
             JOIN note_tags nt ON t.id = nt.tag_id 
             WHERE nt.note_id = ?1"
        )?;
        
        let tags = stmt.query_map(params![note_id], |row| {
            Ok(crate::models::Tag {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                    .unwrap()
                    .with_timezone(&Utc),
            })
        })?
        .collect::<Result<Vec<_>>>()?;
        
        Ok(tags)
    }
}