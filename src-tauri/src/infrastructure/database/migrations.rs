use rusqlite::Result;
use super::Database;

pub fn run_migrations(db: &Database) -> Result<()> {
    let conn = db.connection();
    
    conn.execute_batch("
        -- Categories table
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT,
            parent_id INTEGER,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
            UNIQUE(name, parent_id)
        );
        
        -- Notes table
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            category_id INTEGER,
            selector_id INTEGER,
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
    
    // Migration to add selector_id column to existing databases
    // This will fail silently if the column already exists
    let _ = conn.execute("ALTER TABLE notes ADD COLUMN selector_id INTEGER", []);
    
    // Create selectors table for custom names
    conn.execute("
        CREATE TABLE IF NOT EXISTS selectors (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ", [])?;
    
    // Create index for selector lookups
    conn.execute("
        CREATE INDEX IF NOT EXISTS idx_notes_selector ON notes(selector_id)
    ", [])?;
    
    Ok(())
}