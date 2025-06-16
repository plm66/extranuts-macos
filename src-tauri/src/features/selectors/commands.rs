use tauri::State;
use crate::core::{AppState, error::AppResult};
use super::models::*;
use super::repository::SelectorRepository;

#[tauri::command]
pub async fn create_selector(
    state: State<'_, AppState>,
    request: CreateSelectorRequest,
) -> AppResult<Selector> {
    let db = state.db();
    let repo = SelectorRepository::new(db);
    repo.create_selector(&request)
}

#[tauri::command]
pub async fn update_selector_name(
    state: State<'_, AppState>,
    request: UpdateSelectorRequest,
) -> AppResult<()> {
    let db = state.db();
    let repo = SelectorRepository::new(db);
    repo.update_selector_name(&request)
}

#[tauri::command]
pub async fn get_selector(
    state: State<'_, AppState>,
    id: i64,
) -> AppResult<Option<Selector>> {
    let db = state.db();
    let repo = SelectorRepository::new(db);
    repo.get_selector(id)
}

#[tauri::command]
pub async fn get_all_selectors(
    state: State<'_, AppState>,
) -> AppResult<Vec<Selector>> {
    let db = state.db();
    let repo = SelectorRepository::new(db);
    repo.get_all_selectors()
}

#[tauri::command]
pub async fn delete_selector(
    state: State<'_, AppState>,
    id: i64,
) -> AppResult<()> {
    let db = state.db();
    let repo = SelectorRepository::new(db);
    repo.delete_selector(id)
}

#[tauri::command]
pub async fn selector_exists(
    state: State<'_, AppState>,
    id: i64,
) -> AppResult<bool> {
    let db = state.db();
    let repo = SelectorRepository::new(db);
    repo.selector_exists(id)
}