// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;

use std::sync::{Arc, Mutex};

use commands::{cpu_state, cpu_state_aggregate, memory_state, swap_state, get_app_config};
use config::{Config, Storage};
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
                let config_window_option = app.get_window("config");

                if let Some(config_window) = config_window_option {
                    config_window.show().unwrap();
                    config_window.set_focus().unwrap();
                    return;
                }
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

    tauri::Builder::default()
        .system_tray(create_task_tray())
        .invoke_handler(tauri::generate_handler![
            cpu_state,
            cpu_state_aggregate,
            memory_state,
            swap_state,
            get_app_config,
        ])
        .on_system_tray_event(handle_system_tray)
        .setup(|app| {
            let resolver = app.path_resolver();
            let config_directory_path = resolver.app_local_data_dir().unwrap();

            let config_path = config_directory_path.join("config.json");

            let config = Config::load(config_path);
            let shared: AppState = Arc::new(Mutex::new(config));

            let try_main_window = app.get_window("main");
            if let Some(main_window) = try_main_window {
                let window_config = shared
                    .lock()
                    .unwrap()
                    .window
                    .clone()
                    .unwrap();

                main_window.set_always_on_top(window_config.always_on_top)?;
                main_window.set_decorations(window_config.decoration)?;
            }

            app.manage(shared);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
