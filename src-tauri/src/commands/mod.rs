use std::sync::Arc;
use sysinfo::{MemoryRefreshKind, RefreshKind};
use tauri::{AppHandle, State};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

use crate::{
    config::Config,
    core::{watcher, GlobalState},
    resource::{
        measure_cpu_state, measure_cpu_state_aggregate, measure_memory_state, measure_swap_state,
        CPUState, MemoryState, SwapState,
    },
};

#[tauri::command]
pub fn quit(app: AppHandle) {
    let try_save = app.save_window_state(StateFlags::all());
    if let Err(e) = try_save {
        eprintln!("Failed to save window state: {:?}", e);
    }

    app.exit(0)
}

#[tauri::command]
pub async fn get_app_config(state: State<'_, GlobalState>) -> Result<Config, String> {
    let state = state.lock().await;
    let config = state.config.lock().unwrap().clone();

    Ok(config)
}

#[tauri::command]
pub async fn cpu_state(state: State<'_, GlobalState>) -> Result<Vec<CPUState>, String> {
    let state = state.lock().await;

    let current = state.watcher.lock().unwrap().current_cpu.clone();

    if let Some(current) = current {
        return Ok(current);
    }

    let ms = state.config.lock().unwrap().monitor.update_interval;
    let state_list = measure_cpu_state(ms).await;

    Ok(state_list)
}

#[tauri::command]
pub async fn cpu_state_aggregate(ms: Option<u64>) -> CPUState {
    let ms = ms.unwrap_or(1000);
    measure_cpu_state_aggregate(ms).await
}

#[tauri::command]
pub fn memory_state() -> MemoryState {
    let kind = MemoryRefreshKind::everything();
    let refreshes = RefreshKind::new().with_memory(kind);

    let mut sys = sysinfo::System::new_with_specifics(refreshes);
    sys.refresh_memory();

    measure_memory_state(&sys)
}

#[tauri::command]
pub fn swap_state() -> SwapState {
    let kind = MemoryRefreshKind::everything();
    let refreshes = RefreshKind::new().with_memory(kind);

    let mut sys = sysinfo::System::new_with_specifics(refreshes);
    sys.refresh_memory();

    measure_swap_state(&sys)
}

/// @see https://docs.rs/tauri/latest/tauri/trait.Manager.html
#[tauri::command]
pub async fn start_watcher(
    app: AppHandle,
    global_state: State<'_, GlobalState>,
) -> Result<(), String> {
    let state = global_state.lock().await;

    let cloned_state = Arc::clone(&global_state);
    let handler = tauri::async_runtime::spawn(async move {
        watcher(app, cloned_state).await;
    });

    let old_handler = state.watcher.lock().unwrap().watcher.take();
    if let Some(old_handler) = old_handler {
        println!("Abort old handler");
        old_handler.abort();
    }

    println!("Start watching...");

    // update watching
    state.watcher.lock().unwrap().is_watching = true;
    state.watcher.lock().unwrap().watcher = Some(handler);

    Ok(())
}

#[tauri::command]
pub async fn stop_watcher(global_state: State<'_, GlobalState>) -> Result<(), String> {
    let state = global_state.lock().await;

    let old_handler = state.watcher.lock().unwrap().watcher.take();
    if let Some(old_handler) = old_handler {
        old_handler.abort();
    }

    // update watching
    state.watcher.lock().unwrap().is_watching = false;

    Ok(())
}
