use tauri::AppHandle;
use super::service::WindowService;

#[tauri::command]
pub fn create_floating_window(
    app: AppHandle,
    label: String,
    width: f64,
    height: f64,
) -> Result<(), String> {
    WindowService::create_floating_window(&app, label, width, height)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn toggle_always_on_top(window: tauri::Window) -> Result<(), String> {
    WindowService::toggle_always_on_top(window)
        .map_err(|e| e.message)
}

#[tauri::command]
pub fn show_in_menu_bar(app: AppHandle) -> Result<(), String> {
    WindowService::show_in_menu_bar(&app)
        .map_err(|e| e.message)
}