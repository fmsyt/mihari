// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;

use std::sync::{Arc, Mutex};

use commands::{cpu_state, cpu_state_aggregate, memory_state, swap_state};
use config::Config;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

type AppState = Arc<Mutex<Config>>;

fn create_task_tray() -> SystemTray {
    let always_on_top = CustomMenuItem::new("always_on_top".to_string(), "常に手前に表示する");
    let quit = CustomMenuItem::new("quit".to_string(), "終了");

    let tray = SystemTrayMenu::new()
        .add_item(always_on_top)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray);

    system_tray
}

fn handle_system_tray(app: &AppHandle, event: SystemTrayEvent) {
    let config = app.state::<AppState>();

    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let window = app.get_window("main").unwrap();

            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { tray_id, id, .. } => match id.as_str() {
            "always_on_top" => {
                let mut config = config.lock().unwrap();
                let current_value = config.window.as_ref().unwrap().always_on_top;

                let tray = app.tray_handle_by_id(tray_id.as_str()).unwrap();
                let menu = tray.get_item(id.as_str());

                let window = app.get_window("main").unwrap();
                window.set_always_on_top(!current_value).unwrap();
                menu.set_selected(!current_value).unwrap();

                config.window.as_mut().unwrap().always_on_top = !current_value;
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

fn main() {
    let config: AppState = Arc::new(Mutex::new(Config::default()));

    tauri::Builder::default()
        .manage(config)
        .invoke_handler(tauri::generate_handler![
            cpu_state,
            cpu_state_aggregate,
            memory_state,
            swap_state,
        ])
        .system_tray(create_task_tray())
        .on_system_tray_event(handle_system_tray)
        .setup(|app| {
            let config = app.state::<AppState>();

            let system_tray = app.tray_handle();
            let menu = system_tray.get_item("always_on_top");

            let is_always_on_top = config
                .lock()
                .unwrap()
                .window
                .as_ref()
                .unwrap()
                .always_on_top;

            menu.set_selected(is_always_on_top).unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
