# Migration Guide: From Monolithic to Modular Architecture

## Overview

This guide helps migrate from the old monolithic structure to the new modular architecture.

## File Mapping

### Old Structure → New Structure

```
src-tauri/src/
├── lib.rs (all mixed)      → Split into:
│                             - lib.rs (initialization only)
│                             - features/windows/
│                             - features/notes/
│                             - features/sync/
│
├── database.rs             → infrastructure/database/
│                             - connection.rs
│                             - migrations.rs
│
├── models.rs               → features/notes/models.rs
│                             + features/sync/models.rs
│
└── preferences.rs          → features/preferences/
                              - models.rs
                              - service.rs
```

## Step-by-Step Migration

### Step 1: Remove Old Files

```bash
cd src-tauri/src
# Backup old files first
mkdir _old_backup
mv database.rs models.rs preferences.rs _old_backup/
```

### Step 2: Update Imports

#### In your frontend TypeScript files:

```typescript
// Old
import type { Note } from '../types/models';

// New - No change needed! Frontend stays the same
import type { Note } from '../types/models';
```

The frontend API remains unchanged - all Tauri commands have the same names and signatures.

### Step 3: Update Rust Imports

If you have custom code that imports from the old modules:

```rust
// Old
use crate::database::Database;
use crate::models::{Note, CreateNoteRequest};

// New
use crate::infrastructure::database::Database;
use crate::features::notes::{Note, CreateNoteRequest};
```

## Testing the Migration

1. **Build Test**:
   ```bash
   cd src-tauri
   cargo build
   ```

2. **Run Tests**:
   ```bash
   cargo test
   ```

3. **Development Mode**:
   ```bash
   npm run tauri:dev
   ```

## Common Issues and Solutions

### Issue: "module not found"

**Solution**: Check the new import paths in the architecture diagram.

### Issue: "Database not initialized"

**Solution**: Ensure `run_migrations(&db)` is called in lib.rs setup.

### Issue: "Command not found"

**Solution**: Verify all commands are registered in the invoke_handler.

## Rollback Plan

If you need to rollback:

1. Restore old files from `_old_backup/`
2. Restore old lib.rs
3. Remove new directories: `core/`, `features/`, `infrastructure/`

## Benefits After Migration

1. **Clear separation**: Each developer knows exactly which files to modify
2. **Fewer conflicts**: Features are isolated in separate directories
3. **Better testing**: Each feature can be tested independently
4. **Easier onboarding**: New developers can focus on one feature
5. **Scalable**: Adding new features doesn't touch existing code

## Next Steps

1. Assign feature ownership (see ARCHITECTURE.md)
2. Set up CI/CD to run feature-specific tests
3. Create feature-specific documentation
4. Plan next features using the modular structure