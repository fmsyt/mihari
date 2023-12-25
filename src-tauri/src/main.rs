// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use systemstat::{System, Platform};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn cpu_state() -> String {
    let sys = System::new();
    let cpu = sys.cpu_load_aggregate().unwrap();
    let cpu_load = cpu.done().unwrap();
    let cpu_load = cpu_load.system;

    let cpu_load = cpu_load * 100.0;

    String::from(format!("{:.2}", cpu_load))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cpu_state, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
