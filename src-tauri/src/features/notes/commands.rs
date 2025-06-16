use tauri::State;
use crate::core::AppState;
use super::models::*;
use super::service::NoteService;

#[tauri::command]
pub fn create_note(
    state: State<AppState>,
    request: CreateNoteRequest,
) -> Result<Note, String> {
    let service = NoteService::new(state.db());
    service.create_note(request)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn get_note(
    state: State<AppState>,
    id: i64,
) -> Result<Option<Note>, String> {
    let service = NoteService::new(state.db());
    service.get_note(id)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn search_notes(
    state: State<AppState>,
    options: SearchOptions,
) -> Result<Vec<Note>, String> {
    let service = NoteService::new(state.db());
    service.search_notes(options)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn get_all_notes(
    state: State<AppState>,
) -> Result<Vec<Note>, String> {
    let service = NoteService::new(state.db());
    service.get_all_notes()
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn update_note(
    state: State<AppState>,
    request: UpdateNoteRequest,
) -> Result<Note, String> {
    println!("🔧 Backend update_note command called with request: {:?}", request);
    println!("🔧 Backend selector_id reçu: {:?}", request.selector_id);
    
    let service = NoteService::new(state.db());
    service.update_note(request)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn delete_note(
    state: State<AppState>,
    id: i64,
) -> Result<(), String> {
    println!("delete_note command called with id: {}", id);
    let service = NoteService::new(state.db());
    match service.delete_note(id) {
        Ok(_) => {
            println!("Note {} deleted successfully", id);
            Ok(())
        },
        Err(e) => {
            eprintln!("Failed to delete note {}: {}", id, e.message);
            Err(e.message)
        }
    }
}