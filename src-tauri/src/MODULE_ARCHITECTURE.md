# Module Architecture

This document describes the modular architecture of the Tauri backend, designed to separate concerns and reduce coupling between different feature domains.

## Module Overview

### 1. **window_manager.rs**
- **Purpose**: Manages all window-related operations
- **Responsibilities**:
  - System tray icon creation and event handling
  - Floating window creation and management
  - Window state management (always-on-top, visibility)
- **Commands**:
  - `create_floating_window`
  - `toggle_always_on_top`
  - `show_in_menu_bar`

### 2. **note_manager.rs**
- **Purpose**: Handles all note-related business logic
- **Responsibilities**:
  - Note CRUD operations
  - Search functionality
  - Tag management (through database)
- **Commands**:
  - `create_note`
  - `get_note`
  - `search_notes`
  - `get_all_notes`
- **Dependencies**: Requires database access via `Arc<Mutex<Database>>`

### 3. **sync_manager.rs**
- **Purpose**: Manages synchronization and database migration
- **Responsibilities**:
  - iCloud sync toggle
  - Database migration between local and iCloud storage
  - Sync status reporting
- **Commands**:
  - `get_sync_status`
  - `toggle_icloud_sync`
- **Dependencies**: Requires preferences manager and database access

### 4. **database.rs**
- **Purpose**: Database access layer
- **Responsibilities**:
  - SQLite connection management
  - Schema initialization
  - Low-level CRUD operations
  - Full-text search indexing

### 5. **models.rs**
- **Purpose**: Data structures and types
- **Contains**:
  - `Note`, `Category`, `Tag` structs
  - Request/response types
  - Search options

### 6. **preferences.rs**
- **Purpose**: Application preferences management
- **Responsibilities**:
  - Loading/saving preferences
  - Default values
  - Preference file management

## Architecture Benefits

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Reduced Coupling**: Modules communicate through well-defined interfaces
3. **Parallel Development**: Different features can be developed independently
4. **Testability**: Each module can be unit tested in isolation
5. **Maintainability**: Changes to one feature are less likely to affect others

## Communication Patterns

- **Shared State**: The `AppState` struct contains the shared database wrapped in `Arc<Mutex<Database>>`
- **Manager Pattern**: Each feature domain has a manager struct that encapsulates its operations
- **Dependency Injection**: Managers receive their dependencies through constructors
- **Command Wrappers**: Tauri commands are thin wrappers around manager methods

## Future Improvements

1. **Event System**: Implement an event bus for loose coupling between modules
2. **Trait-based Interfaces**: Define traits for database access to enable mocking
3. **Error Handling**: Centralized error types and handling
4. **Configuration**: Move hardcoded values to configuration files