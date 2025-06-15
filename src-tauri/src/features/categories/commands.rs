use tauri::State;
use crate::core::AppState;
use super::models::{Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryPreset};
use super::service::CategoryService;

#[tauri::command]
pub fn create_category(
    state: State<AppState>,
    request: CreateCategoryRequest,
) -> Result<Category, String> {
    let service = CategoryService::new(state.db());
    service.create_category(request)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn get_category(
    state: State<AppState>,
    id: i64,
) -> Result<Option<Category>, String> {
    let service = CategoryService::new(state.db());
    service.get_category(id)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn get_all_categories(
    state: State<AppState>,
) -> Result<Vec<Category>, String> {
    let service = CategoryService::new(state.db());
    service.get_all_categories()
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn get_hierarchical_categories(
    state: State<AppState>,
) -> Result<Vec<Category>, String> {
    let service = CategoryService::new(state.db());
    service.get_hierarchical_categories()
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn update_category(
    state: State<AppState>,
    request: UpdateCategoryRequest,
) -> Result<Category, String> {
    let service = CategoryService::new(state.db());
    service.update_category(request)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn delete_category(
    state: State<AppState>,
    id: i64,
) -> Result<(), String> {
    let service = CategoryService::new(state.db());
    service.delete_category(id)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn get_category_presets() -> Result<Vec<CategoryPreset>, String> {
    Ok(CategoryPreset::get_default_presets())
}

#[tauri::command]
pub fn create_category_from_preset(
    state: State<AppState>,
    preset_name: String,
) -> Result<Category, String> {
    let service = CategoryService::new(state.db());
    service.create_from_preset(&preset_name)
        .map_err(|e| e.message)
}