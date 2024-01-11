use std::{time::Duration, sync::{Arc, Mutex}};
use tauri::State;
use tokio::time::sleep;

use serde::Serialize;
use systemstat::{Platform, System};

use crate::config::Config;

#[tauri::command]
pub fn get_app_config(state: State<Arc<Mutex<Config>>>) -> Config {
    let config = state.lock().unwrap();
    config.clone()
}

#[derive(Debug, Serialize)]
pub struct CPUState {
    pub system: f32,
    pub user: f32,
    pub nice: f32,
    pub idle: f32,
    pub interrupt: f32,
}

#[tauri::command]
pub async fn cpu_state(ms: Option<u64>) -> Vec<CPUState> {

    let sys = System::new();
    let cpu = sys.cpu_load().unwrap();

    let ms = ms.unwrap_or(1000);
    sleep(Duration::from_millis(ms)).await;

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

    state_list
}

#[tauri::command]
pub async fn cpu_state_aggregate(ms: Option<u64>) -> CPUState {
    let sys = System::new();
    let cpu = sys.cpu_load_aggregate().unwrap();

    let ms = ms.unwrap_or(1000);
    sleep(Duration::from_millis(ms)).await;

    let cpu_load = cpu.done().unwrap();

    CPUState {
        system: cpu_load.system,
        user: cpu_load.user,
        nice: cpu_load.nice,
        idle: cpu_load.idle,
        interrupt: cpu_load.interrupt,
    }
}

#[derive(Debug, Serialize)]
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

#[derive(Debug, Serialize)]
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
