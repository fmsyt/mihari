// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{
    cpu_state,
    memory_state,
    swap_state,
};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cpu_state,
            memory_state,
            swap_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
