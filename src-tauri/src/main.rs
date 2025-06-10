// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;
mod commands;
mod config;
mod core;
mod resource;

use core::{AppState, GlobalState};
use std::{env, sync::Arc, thread};

use commands::{
    cpu_state, cpu_state_aggregate, get_app_config, memory_state, quit, start_watcher,
    stop_watcher, swap_state,
};

use config::{Config, Storage};
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

use tauri_plugin_dialog::DialogExt;
use tokio::{runtime::Runtime, sync::Mutex};

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn main() {
    #[cfg(target_os = "linux")]
    {
        env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(Arc::new(Mutex::new(Config::default())))
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
        .setup(|app| {

            let quit_menu = MenuItemBuilder::with_id("quit", "終了").build(app)?;

            #[cfg(not(target_os = "linux"))]
            let version_menu = MenuItemBuilder::with_id("version", "バージョン情報").build(app)?;

            #[cfg(not(target_os = "linux"))]
            let menu = MenuBuilder::new(app)
                .item(&version_menu)
                .item(&quit_menu)
                .build()?;

            #[cfg(target_os = "linux")]
            let menu = MenuBuilder::new(app)
                .item(&quit_menu)
                .build()?;

            let tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "quit" => {
                        let app = app.clone();
                        quit(app);
                    }
                    "version" => {

                        let handle = thread::spawn(|| {
                            let rt = Runtime::new().expect("Failed to create Tokio runtime");
                            let try_released_version = rt.block_on(utils::get_released_version());
                            if let Ok(released_version) = try_released_version {
                                released_version
                            } else {
                                "不明".to_string()
                            }
                        });

                        let released_version = handle.join().expect("Failed to join thread");

                        let message = format!(
                            "{} v{}\n\n最新バージョン: {}",
                            app.package_info().name,
                            app.package_info().version,
                            released_version,
                        );

                        app.dialog()
                            .message(message)
                            .title("バージョン情報")
                            .blocking_show();
                    }
                    _ => (),
                })
                .on_tray_icon_event(move |tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(webview_window) = app.get_webview_window("main") {
                            let _ = webview_window.show();
                            let _ = webview_window.set_focus();
                        }
                    }
                })
                .build(app)?;

            let icon = include_bytes!("../icons/icon.ico").to_vec();
            let image = Image::from_bytes(&icon).expect("Failed to load icon image");

            tray.set_icon(Some(image)).expect("Failed to set tray icon");

            let config_directory_path = app
                .path()
                .config_dir()
                .expect("Failed to get config directory path");

            let config_path = config_directory_path.join("config.json");
            let config = Config::load(config_path);

            #[cfg(debug_assertions)]
            {
                let try_main_window = app.get_webview_window("main");
                if let Some(main_window) = try_main_window {
                    main_window.open_devtools();
                }
            }

            let shared: GlobalState = Arc::new(Mutex::new(AppState::from(config)));
            app.manage(shared);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
