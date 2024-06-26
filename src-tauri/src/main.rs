// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;
mod core;
mod resource;

use core::{AppState, GlobalState};
use std::{process::exit, sync::Arc};

use commands::{
    cpu_state, cpu_state_aggregate, get_app_config, memory_state, quit, start_watcher, stop_watcher, swap_state
};
use config::{Config, Storage};
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
};

use tokio::sync::Mutex;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn handle_window(event: tauri::GlobalWindowEvent) {
    match event.event() {
        tauri::WindowEvent::CloseRequested { .. } => match event.window().label() {
            "main" => {
                exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

fn create_task_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "終了");

    let tray = SystemTrayMenu::new()
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
            "quit" => {
                let app = app.clone();
                quit(app);
            }
            _ => {}
        },
        _ => {}
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_context_menu::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .system_tray(create_task_tray())
        .manage(Arc::new(Mutex::new(Config::default())))
        .on_window_event(handle_window)
        .invoke_handler(tauri::generate_handler![
            quit,
            cpu_state,
            cpu_state_aggregate,
            memory_state,
            swap_state,
            get_app_config,
            stop_watcher,
            start_watcher,
        ])
        .on_system_tray_event(handle_system_tray)
        .setup(|app| {
            let resolver = app.path_resolver();
            let config_directory_path_option = resolver.app_local_data_dir();
            if let None = config_directory_path_option {
                eprintln!("Failed to get config directory path");
                return Err("Failed to get config directory path".into());
            }

            let config_directory_path = config_directory_path_option.unwrap();

            let config_path = config_directory_path.join("config.json");
            let config = Config::load(config_path);

            let try_main_window = app.get_window("main");
            if let Some(main_window) = try_main_window {
                let window_config = config.window.clone();
                main_window
                    .set_always_on_top(window_config.always_on_top)
                    .expect("Failed to set always on top");
                main_window
                    .set_decorations(window_config.decoration)
                    .expect("Failed to set decoration");

                #[cfg(debug_assertions)]
                main_window.open_devtools();
            }

            let shared: GlobalState = Arc::new(Mutex::new(AppState::from(config)));
            app.manage(shared);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
