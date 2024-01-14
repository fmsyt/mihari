use std::{
    sync::Arc,
    time::Duration,
};
use tauri::State;

use serde::Serialize;
use systemstat::{Platform, System};

use crate::{
    config::Config,
    core::GlobalState,
};

#[tauri::command]
pub async fn get_app_config(state: State<'_, GlobalState>) -> Result<Config, String> {
    let state = state.lock().await;
    let config = state.config.lock().unwrap().clone();

    Ok(config)
}

#[derive(Debug, Clone, Serialize)]
pub struct CPUState {
    pub system: f32,
    pub user: f32,
    pub nice: f32,
    pub idle: f32,
    pub interrupt: f32,
}

#[tauri::command]
pub async fn cpu_state(state: State<'_, GlobalState>) -> Result<Vec<CPUState>, String> {

    let state = state.lock().await;

    let current = state.watcher.lock().unwrap().current_cpu.clone();

    if let Some(current) = current {
        return Ok(current);
    }

    let sys = System::new();
    let cpu = sys.cpu_load().unwrap();

    let ms = state.config.lock().unwrap().monitor.update_interval;
    tokio::time::sleep(Duration::from_millis(ms)).await;

    let cpu_load = cpu.done().unwrap();

    let state_list = cpu_load
        .iter()
        .map(|cpu| CPUState {
            system: cpu.system,
            user: cpu.user,
            nice: cpu.nice,
            idle: cpu.idle,
            interrupt: cpu.interrupt,
        })
        .collect();

    Ok(state_list)
}

#[tauri::command]
pub async fn cpu_state_aggregate(ms: Option<u64>) -> CPUState {
    let sys = System::new();
    let cpu = sys.cpu_load_aggregate().unwrap();

    let ms = ms.unwrap_or(1000);
    tokio::time::sleep(Duration::from_millis(ms)).await;

    let cpu_load = cpu.done().unwrap();

    CPUState {
        system: cpu_load.system,
        user: cpu_load.user,
        nice: cpu_load.nice,
        idle: cpu_load.idle,
        interrupt: cpu_load.interrupt,
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct MemoryState {
    pub total: u64,
    pub free: u64,
}

#[tauri::command]
pub fn memory_state() -> MemoryState {
    let sys = System::new();
    let mem = sys.memory().unwrap();

    MemoryState {
        total: mem.total.as_u64(),
        free: mem.free.as_u64(),
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct SwapState {
    pub total: u64,
    pub free: u64,
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
pub async fn watch(global_state: State<'_, GlobalState>) -> Result<(), String> {

    let state = global_state.lock().await;

    let cloned_state = Arc::clone(&global_state);
    let handler = tauri::async_runtime::spawn(async move {
        watcher(cloned_state).await;
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

async fn watcher(state: GlobalState) {
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
