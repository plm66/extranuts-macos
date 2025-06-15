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
    
    pub fn create_floating_note(
        app: &AppHandle,
        note_id: i64,
        title: String,
        _content: String,
    ) -> AppResult<()> {
        // Create unique window label with note ID
        let window_label = format!("floating_note_{}", note_id);
        
        // Create the floating window with URL parameters (simple encoding)
        let url = format!("index.html?floating=true&noteId={}&title={}&content={}", 
            note_id, 
            title.replace(" ", "%20").replace("&", "%26"), 
            "test_content" // Simplified for now
        );
        
        let _window = WebviewWindowBuilder::new(
            app, 
            window_label, 
            WebviewUrl::App(url.into())
        )
            .title(&format!("Note: {}", title))
            .inner_size(400.0, 300.0)
            .min_inner_size(300.0, 200.0)
            .resizable(true)
            .always_on_top(true)
            .decorations(false)  // Remove window decorations for ScreenFloat-like appearance
            .skip_taskbar(true)
            .transparent(true)   // Enable transparency for glassmorphism effect
            .build()
            .map_err(|e| AppError::new("FLOATING_NOTE_CREATE_ERROR", e.to_string()))?;
        
        // Window will read data from URL parameters
        
        Ok(())
    }
}