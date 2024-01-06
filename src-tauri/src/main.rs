// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{cpu_state, cpu_state_aggregate, memory_state, swap_state};
use tauri::{
    AppHandle, CustomMenuItem, GlobalWindowEvent, Manager, SystemTray, SystemTrayEvent,
    SystemTrayMenu, WindowEvent,
};

fn handle_event(event: GlobalWindowEvent) {
    match event.event() {
        WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            event.window().hide().unwrap();
        }
        _ => {}
    }
}

fn create_task_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray = SystemTrayMenu::new().add_item(quit);

    SystemTray::new().with_menu(tray)
}

fn handle_system_tray(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let window = app.get_window("main").unwrap();

            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            if id == "quit" {
                app.exit(0)
            }
        }
        _ => {}
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cpu_state,
            cpu_state_aggregate,
            memory_state,
            swap_state,
        ])
        .on_window_event(handle_event)
        .system_tray(create_task_tray())
        .on_system_tray_event(handle_system_tray)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
