use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use crate::core::error::{AppError, AppResult};

pub struct WindowService;

impl WindowService {
    pub fn create_floating_window(
        app: &AppHandle,
        label: String,
        width: f64,
        height: f64,
    ) -> AppResult<()> {
        WebviewWindowBuilder::new(app, label.clone(), WebviewUrl::App("index.html".into()))
            .title("Extranuts Note")
            .inner_size(width, height)
            .resizable(true)
            .always_on_top(true)
            .decorations(true)
            .skip_taskbar(true)
            .build()
            .map_err(|e| AppError::new("WINDOW_CREATE_ERROR", e.to_string()))?;
        
        Ok(())
    }
    
    pub fn toggle_always_on_top(window: tauri::Window) -> AppResult<()> {
        let current = window.is_always_on_top()
            .map_err(|e| AppError::new("WINDOW_STATE_ERROR", e.to_string()))?;
        
        window.set_always_on_top(!current)
            .map_err(|e| AppError::new("WINDOW_UPDATE_ERROR", e.to_string()))?;
        
        Ok(())
    }
    
    pub fn show_in_menu_bar(app: &AppHandle) -> AppResult<()> {
        #[cfg(target_os = "macos")]
        {
            use tauri::ActivationPolicy;
            let _ = app.set_activation_policy(ActivationPolicy::Accessory);
        }
        
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.hide();
        }
        
        Ok(())
    }
}