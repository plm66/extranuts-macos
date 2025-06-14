use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime, AppHandle, Emitter,
};

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let _ = TrayIconBuilder::with_id("extranuts-tray")
        .tooltip("Extranuts")
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            TrayIconEvent::Click {
                button: MouseButton::Right,
                button_state: MouseButtonState::Up,
                ..
            } => {
                tray.app_handle()
                    .emit("tray-menu", ())
                    .expect("failed to emit tray menu event");
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

#[tauri::command]
fn create_floating_window(app: AppHandle, label: String, width: f64, height: f64) -> Result<(), String> {
    use tauri::{WebviewUrl, WebviewWindowBuilder};
    
    WebviewWindowBuilder::new(&app, label.clone(), WebviewUrl::App("index.html".into()))
        .title("Extranuts Note")
        .inner_size(width, height)
        .resizable(true)
        .always_on_top(true)
        .decorations(true)
        .skip_taskbar(true)
        .build()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn toggle_always_on_top(window: tauri::Window) -> Result<(), String> {
    let current = window.is_always_on_top().map_err(|e| e.to_string())?;
    window.set_always_on_top(!current).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn show_in_menu_bar(app: AppHandle) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let _ = app.set_activation_policy(ActivationPolicy::Accessory);
    }
    
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                let _ = app.set_activation_policy(ActivationPolicy::Regular);
            }
            
            create_tray(app.handle())?;
            
            let main_window = app.get_webview_window("main").unwrap();
            main_window.show()?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_floating_window,
            toggle_always_on_top,
            show_in_menu_bar
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}