// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;

use std::sync::{Arc, Mutex};

use commands::{cpu_state, cpu_state_aggregate, memory_state, swap_state};
use config::Config;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
};

type AppState = Arc<Mutex<Config>>;

fn create_task_tray() -> SystemTray {

    let config_menu_item = CustomMenuItem::new("config".to_string(), "設定");
    let quit = CustomMenuItem::new("quit".to_string(), "終了");

    let tray = SystemTrayMenu::new()
        .add_item(config_menu_item)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray);

    system_tray
}

fn handle_system_tray(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let window = app.get_window("main").unwrap();

            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "config" => {
                let config_window = app.get_window("config").unwrap();
                config_window.show().unwrap();
                config_window.set_focus().unwrap();
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
        .system_tray(create_task_tray())
        .manage(config)
        .invoke_handler(tauri::generate_handler![
            cpu_state,
            cpu_state_aggregate,
            memory_state,
            swap_state,
        ])
        .on_system_tray_event(handle_system_tray)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
