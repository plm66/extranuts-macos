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

**Your notes are stored in SQLite databases at these locations:**

#### Local Storage (Default)
```
~/Library/Application Support/com.extranuts.app/extranuts.db
```
- **Where your notes are now**: This is the current default location
- Per-user isolation with macOS user permissions
- Automatically included in Time Machine backups
- Hidden from casual browsing (system directory)
- No internet required - fully offline
- **App Identifier**: `com.extranuts.app` (from tauri.conf.json)

#### iCloud Drive Storage (Optional)
```
~/Library/Mobile Documents/iCloud~com~extranuts~app/Documents/extranuts.db
```
- **Alternative location** when iCloud sync is enabled
- Automatic sync across all your Apple devices
- Available offline with sync when online
- Seamless handoff between Mac and future iOS app
- Uses Apple's proven iCloud Drive sync infrastructure
- **Folder Structure**: Creates iCloud container for the app

#### Additional Files
```
# Preferences (always local)
~/Library/Application Support/com.extranuts.app/preferences.json

# Database support files (same directory as main DB)
extranuts.db-wal    # Write-Ahead Log
extranuts.db-shm    # Shared Memory
```

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
// Note Operations
create_note(request: CreateNoteRequest) -> Result<Note, String>
get_note(id: i64) -> Result<Option<Note>, String>
search_notes(options: SearchOptions) -> Result<Vec<Note>, String>
get_all_notes() -> Result<Vec<Note>, String>
update_note(request: UpdateNoteRequest) -> Result<Note, String>
delete_note(id: i64) -> Result<(), String>

// Sync Operations
get_sync_status() -> Result<bool, String>
toggle_icloud_sync(enabled: bool) -> Result<String, String>

// Export Operations
export_to_obsidian(vault_path: String, note_ids: Option<Vec<i64>>, target_folder: Option<String>) -> Result<ExportResult, String>
validate_obsidian_vault(vault_path: String) -> Result<bool, String>

// Preferences Operations
get_preferences() -> Result<Preferences, String>
update_preferences(preferences: Preferences) -> Result<(), String>
```

### Frontend Services

```typescript
// Note operations
notesService.createNote(request: CreateNoteRequest): Promise<Note>
notesService.getNote(id: string): Promise<Note | null>
notesService.searchNotes(query: string): Promise<Note[]>
notesService.getAllNotes(): Promise<Note[]>
notesService.updateNote(id: string, updates: Partial<Note>): Promise<void>
notesService.deleteNote(id: string): Promise<void>

// Export operations
exportService.exportToObsidian(vaultPath: string, noteIds?: string[], targetFolder?: string): Promise<ExportResult>
exportService.validateObsidianVault(vaultPath: string): Promise<boolean>
exportService.selectObsidianVault(): Promise<string | null>

// Preferences operations
preferencesService.getPreferences(): Promise<Preferences>
preferencesService.updatePreferences(preferences: Preferences): Promise<void>
preferencesService.updateEditorPreferences(editor: Partial<EditorPreferences>): Promise<void>

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
Users can manually backup by copying the entire app directory:

**Current Local Storage:**
```bash
# Backup entire app data (recommended)
cp -r ~/Library/Application\ Support/com.extranuts.app ~/Desktop/extranuts-backup

# Or just the database files
cp ~/Library/Application\ Support/com.extranuts.app/extranuts.db* ~/Desktop/
```

**iCloud Storage (if enabled):**
```bash
# Backup from iCloud Drive location
cp -r ~/Library/Mobile\ Documents/iCloud~com~extranuts~app ~/Desktop/extranuts-icloud-backup
```

**⚠️ Important**: Always copy the `.db`, `.db-wal`, and `.db-shm` files together to ensure database consistency.

## Migration Path

### Export System

#### Obsidian Export (Implemented)

Extranuts provides seamless export to Obsidian vaults with full metadata preservation:

**Export Modes:**
- **Bulk Export**: Export all notes in your collection
- **Single Export**: Export only the currently selected note

**Export Configuration:**
- **Vault Selection**: Choose your Obsidian vault location
- **Folder Selection**: Target specific folders within vault (e.g., "Imports", "Daily Notes", "Projects/MyProject")
- **Auto-Creation**: Non-existent folders are created automatically

**Export Format:**
```markdown
---
title: "Note Title"
created: 2024-12-15 17:00:00
updated: 2024-12-15 17:30:00
tags:
  - tag1
  - tag2
pinned: true
source: Extranuts
---

Note content with preserved [[wikilinks]] format...
```

**Export Structure:**
```
ObsidianVault/
├── TargetFolder/           # Optional custom folder
│   └── Extranuts_Export_20241215_170000/  # Timestamped export
│       ├── Note1.md
│       ├── Note2.md
│       └── ...
```

**Features:**
- Preserves wikilinks in `[[note]]` format for Obsidian compatibility
- Includes comprehensive frontmatter with metadata
- Sanitizes filenames for cross-platform compatibility
- Creates timestamped folders to prevent overwrites
- Supports nested folder structures

### Future Export Considerations

1. **JSON Export**: Structured data export for developers/backup
2. **Markdown Export**: Plain markdown without frontmatter
3. **CSV Export**: Tabular format for spreadsheet analysis
4. **OPML Export**: Outline format for mind mapping tools
5. **Direct Integration**: APIs for other note-taking apps

### Additional Future Considerations

1. **Compression**: Consider zlib for large note content
2. **Attachments**: Store in separate files, reference in DB
3. **Encryption**: Optional per-note encryption for sensitive data

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

4. **Export Issues**
   - Verify Obsidian vault contains `.obsidian` directory
   - Check write permissions to target vault folder
   - Ensure sufficient disk space for export
   - Validate folder names don't contain illegal characters

### Debug Commands

**For Current Local Storage:**
```bash
# Check database integrity
sqlite3 ~/Library/Application\ Support/com.extranuts.app/extranuts.db "PRAGMA integrity_check;"

# View database stats
sqlite3 ~/Library/Application\ Support/com.extranuts.app/extranuts.db "SELECT COUNT(*) FROM notes;"

# Check FTS index
sqlite3 ~/Library/Application\ Support/com.extranuts.app/extranuts.db "SELECT COUNT(*) FROM notes_fts;"

# View all tables
sqlite3 ~/Library/Application\ Support/com.extranuts.app/extranuts.db ".tables"

# Check database size
ls -lh ~/Library/Application\ Support/com.extranuts.app/extranuts.db*
```

**Quick Access:**
```bash
# Open database directory in Finder
open ~/Library/Application\ Support/com.extranuts.app/

# Direct database access
sqlite3 ~/Library/Application\ Support/com.extranuts.app/extranuts.db
```

## Conclusion

The storage system is designed for reliability, performance, and seamless Apple ecosystem integration. By combining SQLite's proven reliability with iCloud Drive's sync capabilities, Extranuts provides a best-in-class storage solution for personal note-taking.