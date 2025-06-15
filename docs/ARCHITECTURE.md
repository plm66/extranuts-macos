# Extranuts Architecture Documentation

## Overview

This document describes the modular architecture of Extranuts, designed to enable parallel development and minimize merge conflicts between developers working on different features.

## Architecture Principles

1. **Feature-based Modules**: Each feature is self-contained with its own models, services, and commands
2. **Clean Dependencies**: Features depend only on core/infrastructure, not on each other
3. **Single Responsibility**: Each module has one clear purpose
4. **Minimal Shared State**: Only essential state is shared via AppState

## Directory Structure

```
src-tauri/src/
├── core/                    # Minimal shared core
│   ├── mod.rs              # Core module exports
│   ├── state.rs            # Shared application state (DB reference only)
│   └── error.rs            # Common error types (AppError, AppResult)
│
├── infrastructure/         # Technical infrastructure (no business logic)
│   ├── mod.rs
│   ├── database/          # Database connection and migrations
│   │   ├── mod.rs
│   │   ├── connection.rs  # Database struct and connection management
│   │   └── migrations.rs  # SQL schema migrations
│   └── storage/           # File system paths
│       ├── mod.rs
│       └── paths.rs       # Storage locations (local/iCloud)
│
├── features/              # Business features (isolated modules)
│   ├── mod.rs
│   │
│   ├── windows/          # Window & tray management
│   │   ├── mod.rs
│   │   ├── commands.rs   # Tauri commands for windows
│   │   ├── service.rs    # Window business logic
│   │   └── tray.rs       # System tray implementation
│   │
│   ├── notes/           # Note CRUD operations
│   │   ├── mod.rs
│   │   ├── commands.rs  # Tauri commands for notes
│   │   ├── service.rs   # Note business logic
│   │   ├── models.rs    # Note, Category, Tag types
│   │   └── repository.rs # Database queries for notes
│   │
│   ├── sync/            # iCloud sync functionality
│   │   ├── mod.rs
│   │   ├── commands.rs  # Sync toggle commands
│   │   ├── service.rs   # Sync logic & DB migration
│   │   └── models.rs    # Sync-specific types
│   │
│   └── preferences/     # User preferences
│       ├── mod.rs
│       ├── models.rs    # Preferences structure
│       └── service.rs   # Preferences load/save
│
└── lib.rs              # App initialization (minimal)
```

## Module Responsibilities

### Core Module
- **Purpose**: Shared types used across all features
- **Contains**: AppState (holds DB reference), AppError, AppResult
- **Dependencies**: None
- **Used by**: All features

### Infrastructure Module
- **Purpose**: Technical utilities without business logic
- **Contains**: Database connection, migrations, file paths
- **Dependencies**: Core only
- **Used by**: Features that need DB or file access

### Feature Modules

#### Windows Feature
- **Purpose**: Window management and system tray
- **Owner**: UI/UX Developer
- **Commands**: `create_floating_window`, `toggle_always_on_top`, `show_in_menu_bar`
- **External Dependencies**: Tauri window APIs

#### Notes Feature
- **Purpose**: All note-related operations
- **Owner**: Backend Developer
- **Commands**: `create_note`, `get_note`, `search_notes`, `get_all_notes`
- **Models**: Note, Category, Tag, CreateNoteRequest, SearchOptions
- **Database Tables**: notes, categories, tags, note_tags

#### Sync Feature
- **Purpose**: iCloud sync and database migration
- **Owner**: Platform Integration Developer
- **Commands**: `get_sync_status`, `toggle_icloud_sync`
- **Special**: Can trigger database migration between local/iCloud

#### Preferences Feature
- **Purpose**: User settings management
- **Owner**: Settings Developer
- **No Commands**: Used internally by other features
- **Storage**: JSON file in app data directory

## Development Guidelines

### Adding a New Feature

1. Create new directory under `features/`
2. Add feature module to `features/mod.rs`
3. Create standard structure:
   ```
   features/your_feature/
   ├── mod.rs       # Public exports
   ├── commands.rs  # Tauri commands
   ├── service.rs   # Business logic
   └── models.rs    # Feature-specific types
   ```
4. Register commands in `lib.rs` invoke_handler
5. Keep all feature logic isolated

### Working on Existing Features

1. **Check ownership**: See module responsibilities above
2. **Stay in your lane**: Only modify files in your feature directory
3. **Use shared types**: Import from core/infrastructure, not other features
4. **Test in isolation**: Features should work independently

### Shared Code Changes

If you need to modify core or infrastructure:
1. **Discuss first**: These changes affect everyone
2. **Keep it minimal**: Only truly shared functionality
3. **Document changes**: Update this file
4. **Coordinate merges**: Let team know about breaking changes

## Database Access Pattern

All database access follows this pattern:

1. **Command** (in `commands.rs`) receives request from frontend
2. **Service** (in `service.rs`) contains business logic
3. **Repository** (in `repository.rs`) executes SQL queries
4. **Models** (in `models.rs`) define data structures

Example flow:
```
Frontend → Command → Service → Repository → Database
          ↓          ↓          ↓            ↓
          Tauri    Business   SQL         SQLite
          Handler   Logic     Queries
```

## Error Handling

All errors are converted to `AppError` at module boundaries:

```rust
// In repository
db_operation()
    .map_err(|e| AppError::new("DATABASE_ERROR", e.to_string()))

// In command
service.operation()
    .map_err(|e| e.message)  // Convert AppError to String for Tauri
```

## State Management

The `AppState` is minimal by design:
- Only contains `Arc<Mutex<Database>>` reference
- Features create their own services using this reference
- No feature-specific state in AppState

## Testing Strategy

Each feature can be tested independently:

1. **Unit tests**: Test services with mock database
2. **Integration tests**: Test commands with real database
3. **Feature tests**: Test entire feature in isolation

## Benefits of This Architecture

1. **Parallel Development**: Multiple developers work without conflicts
2. **Clear Boundaries**: Easy to understand what code to modify
3. **Scalability**: New features don't affect existing ones
4. **Maintainability**: Each feature is self-contained
5. **Testability**: Features can be tested in isolation
6. **Onboarding**: New developers can focus on one feature

## Common Pitfalls to Avoid

1. **Don't share between features**: Use core/infrastructure instead
2. **Don't add to AppState**: Keep it minimal
3. **Don't modify other features**: Coordinate if integration needed
4. **Don't skip the service layer**: Keep commands thin
5. **Don't forget error conversion**: Use AppError consistently

## Future Considerations

As the app grows, consider:
- Feature flags for optional features
- Plugin system for third-party features
- Message bus for feature communication
- Dependency injection for better testing