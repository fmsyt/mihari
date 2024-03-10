use std::{sync::Arc, time::Duration};
use tauri::{AppHandle, State};

use systemstat::{Platform, System};

use crate::{
    config::Config,
    core::{watcher, GlobalState},
    resource::{
        measure_cpu_state, measure_cpu_state_aggregate, measure_memory_state, CPUState,
        MemoryState, SwapState,
    },
};

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
    measure_memory_state()
}

#[tauri::command]
pub fn swap_state() -> SwapState {
    let sys = System::new();
    let swap = sys.swap().unwrap();

    SwapState {
        total: swap.total.as_u64(),
        free: swap.free.as_u64(),
    }
}

/// @see https://docs.rs/tauri/latest/tauri/trait.Manager.html
#[tauri::command]
pub async fn watch_legacy(global_state: State<'_, GlobalState>) -> Result<(), String> {
    let state = global_state.lock().await;

    let cloned_state = Arc::clone(&global_state);
    let handler = tauri::async_runtime::spawn(async move {
        watcher_legacy(cloned_state).await;
    });

    let old_handler = state.watcher.lock().unwrap().watcher.take();
    if let Some(old_handler) = old_handler {
        old_handler.abort();
    }

    // update watching
    state.watcher.lock().unwrap().is_watching = true;
    state.watcher.lock().unwrap().watcher = Some(handler);

    Ok(())
}

async fn watcher_legacy(state: GlobalState) {
    loop {
        let state = state.lock().await;

        let sys = System::new();
        let cpu = sys.cpu_load().unwrap();

        let ms = state.config.lock().unwrap().monitor.update_interval;
        let interval = Duration::from_millis(ms);
        tokio::time::sleep(interval).await;

        let cpu_load = cpu.done().unwrap();

        let state_list: Vec<CPUState> = cpu_load
            .iter()
            .map(|cpu| CPUState {
                system: cpu.system,
                user: cpu.user,
                nice: cpu.nice,
                idle: cpu.idle,
                interrupt: cpu.interrupt,
            })
            .collect();

        let mut watcher = state.watcher.lock().unwrap();
        watcher.current_cpu = Some(state_list.clone());

        // println!("state_list");
        // println!("{:?}", serde_json::to_string(&state_list).unwrap());
    }
}

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
        old_handler.abort();
    }

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
