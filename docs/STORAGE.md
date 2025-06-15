# Extranuts Storage Documentation

## Overview

Extranuts uses SQLite as its primary storage engine, optimized for handling 10,000+ notes with sub-10ms search performance. The app supports both local storage and iCloud Drive sync for cross-device access.

## Storage Architecture

### Database Engine: SQLite

We chose SQLite for several critical reasons:

1. **Native Performance**: In-process database with zero network latency
2. **macOS Integration**: Ships with macOS, used by Apple's own apps (Notes, Photos, Messages)
3. **Full-Text Search**: FTS5 extension enables instant search across thousands of notes
4. **ACID Compliance**: Ensures data integrity with automatic crash recovery
5. **Small Footprint**: Entire database engine adds ~1MB to app size

### Storage Locations

The database location depends on the user's sync preference:

#### Local Storage (Default)
```
~/Library/Application Support/Extranuts/extranuts.db
```
- Per-user isolation
- Time Machine compatible
- Hidden from casual browsing
- No internet required

#### iCloud Drive Storage (Optional)
```
~/Library/Mobile Documents/iCloud~com~extranuts~app/Documents/extranuts.db
```
- Automatic sync across Apple devices
- Available offline
- Seamless handoff between Mac and future iOS app
- Uses Apple's proven sync infrastructure

## Database Schema

### Core Tables

```sql
-- Categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
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
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Note-Tag junction table (many-to-many)
CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### Full-Text Search

```sql
-- FTS5 virtual table for instant search
CREATE VIRTUAL TABLE notes_fts USING fts5(
    title, 
    content,
    content=notes,
    content_rowid=id,
    tokenize='porter unicode61'
);
```

The FTS index is automatically maintained through triggers on INSERT, UPDATE, and DELETE operations.

### Performance Indexes

```sql
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_category ON notes(category_id);
CREATE INDEX idx_notes_pinned ON notes(is_pinned DESC, updated_at DESC);
CREATE INDEX idx_note_tags_note ON note_tags(note_id);
CREATE INDEX idx_note_tags_tag ON note_tags(tag_id);
```

## Performance Optimizations

### SQLite Configuration

```rust
PRAGMA journal_mode = WAL;        // Write-Ahead Logging for concurrent reads
PRAGMA synchronous = NORMAL;      // Balance between safety and speed
PRAGMA cache_size = -64000;       // 64MB cache in RAM
PRAGMA mmap_size = 268435456;    // 256MB memory-mapped I/O
PRAGMA temp_store = MEMORY;       // Temporary tables in RAM
PRAGMA foreign_keys = ON;         // Enforce referential integrity
```

### Expected Performance

With these optimizations and proper indexing:
- **Search**: <10ms for full-text search across 10,000 notes
- **Insert**: <5ms per note including tags
- **List**: <20ms to load 100 notes with tags
- **Startup**: <50ms to open database connection

## Data Models

### Rust Models (Backend)

```rust
pub struct Note {
    pub id: Option<i64>,
    pub title: String,
    pub content: String,
    pub category_id: Option<i64>,
    pub is_pinned: bool,
    pub tags: Vec<Tag>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct Category {
    pub id: Option<i64>,
    pub name: String,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
}

pub struct Tag {
    pub id: Option<i64>,
    pub name: String,
    pub created_at: DateTime<Utc>,
}
```

### TypeScript Models (Frontend)

```typescript
export interface Note {
  id?: number;
  title: string;
  content: string;
  category_id?: number;
  is_pinned: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}
```

## iCloud Sync Implementation

### Toggle Mechanism

When a user enables/disables iCloud sync:

1. **Save Preference**: Update local preferences file
2. **Copy Database**: Migrate existing database to new location
3. **Include WAL/SHM**: Copy Write-Ahead Log and Shared Memory files
4. **Atomic Switch**: Replace database connection with new location
5. **Clean Handoff**: No data loss or corruption

### Sync Behavior

- **Automatic**: Once in iCloud Drive, macOS handles all syncing
- **Offline First**: Full functionality without internet
- **Conflict Resolution**: Last-write-wins (standard iCloud behavior)
- **Selective Sync**: Users control which devices participate

## API Reference

### Tauri Commands

```rust
// Create a new note
create_note(request: CreateNoteRequest) -> Result<Note, String>

// Get a specific note
get_note(id: i64) -> Result<Option<Note>, String>

// Search notes with filters
search_notes(options: SearchOptions) -> Result<Vec<Note>, String>

// Get all notes
get_all_notes() -> Result<Vec<Note>, String>

// Check sync status
get_sync_status() -> Result<bool, String>

// Toggle iCloud sync
toggle_icloud_sync(enabled: bool) -> Result<String, String>
```

### Frontend Services

```typescript
// Note operations
notesService.createNote(request: CreateNoteRequest): Promise<Note>
notesService.getNote(id: number): Promise<Note | null>
notesService.searchNotes(options: SearchOptions): Promise<Note[]>
notesService.getAllNotes(): Promise<Note[]>

// Sync operations
syncService.getSyncStatus(): Promise<boolean>
syncService.toggleICloudSync(enabled: boolean): Promise<string>
```

## Security Considerations

1. **App Sandbox**: Enabled via entitlements
2. **File Permissions**: User-specific with OS-level protection
3. **No Encryption**: Relies on FileVault and iCloud's encryption
4. **SQL Injection**: Prevented via parameterized queries
5. **Path Traversal**: Restricted to designated directories

## Backup Strategy

### Automatic Backups
- **Time Machine**: Both storage locations are included
- **iCloud Backup**: When using iCloud Drive storage
- **Version History**: iCloud Drive keeps file versions

### Manual Backup
Users can manually backup by copying:
- Local: `~/Library/Application Support/Extranuts/`
- iCloud: `~/Library/Mobile Documents/iCloud~com~extranuts~app/`

## Migration Path

### Future Considerations

1. **Export/Import**: Add JSON/Markdown export for portability
2. **Compression**: Consider zlib for large note content
3. **Attachments**: Store in separate files, reference in DB
4. **Encryption**: Optional per-note encryption for sensitive data

## Troubleshooting

### Common Issues

1. **Database Locked Error**
   - Ensure only one app instance is running
   - Check for zombie processes
   - WAL mode should prevent most locking issues

2. **iCloud Not Syncing**
   - Verify iCloud Drive is enabled in System Preferences
   - Check available iCloud storage
   - Ensure good network connection

3. **Performance Degradation**
   - Run `VACUUM` command periodically
   - Check index health with `ANALYZE`
   - Monitor database size (should handle 1GB+ easily)

### Debug Commands

```bash
# Check database integrity
sqlite3 ~/Library/Application\ Support/Extranuts/extranuts.db "PRAGMA integrity_check;"

# View database stats
sqlite3 ~/Library/Application\ Support/Extranuts/extranuts.db "SELECT COUNT(*) FROM notes;"

# Check FTS index
sqlite3 ~/Library/Application\ Support/Extranuts/extranuts.db "SELECT COUNT(*) FROM notes_fts;"
```

## Conclusion

The storage system is designed for reliability, performance, and seamless Apple ecosystem integration. By combining SQLite's proven reliability with iCloud Drive's sync capabilities, Extranuts provides a best-in-class storage solution for personal note-taking.