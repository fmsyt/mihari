use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

use serde::Serialize;
use tauri::{async_runtime::JoinHandle, AppHandle, Manager};

use crate::{
    config::Config,
    resource::{measure_cpu_state, measure_memory_state, CPUState, MemoryState, SwapState},
};

#[derive(Debug)]
pub struct AppState {
    pub config: Mutex<Config>,
    pub watcher: Mutex<Watcher>,
}

#[derive(Debug)]
pub struct Watcher {
    pub is_watching: bool,
    pub watcher: Option<JoinHandle<()>>,
    pub current_cpu: Option<Vec<CPUState>>,
    pub current_cpu_aggregated: Option<CPUState>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Summary {
    pub cpu: Option<Vec<CPUState>>,
    pub cpu_aggregated: Option<CPUState>,
    pub memory: Option<MemoryState>,
    pub swap: Option<SwapState>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            config: Mutex::new(Config::default()),
            watcher: Mutex::new(Watcher::default()),
        }
    }
}

impl Default for Watcher {
    fn default() -> Self {
        Self {
            is_watching: false,
            watcher: None,
            current_cpu: None,
            current_cpu_aggregated: None,
        }
    }
}

impl From<Config> for AppState {
    fn from(config: Config) -> Self {
        Self {
            config: Mutex::new(config),
            watcher: Mutex::new(Watcher::default()),
        }
    }
}

pub type GlobalState = Arc<tokio::sync::Mutex<AppState>>;

pub async fn watcher(app: AppHandle, state: GlobalState) {
    loop {
        let state = state.lock().await;

        let ms = state.config.lock().unwrap().monitor.update_interval;
        let interval = Duration::from_millis(ms);
        tokio::time::sleep(interval).await;

        let current_cpu = measure_cpu_state(ms).await;

        let memory = measure_memory_state();
        let swap = SwapState { total: 0, free: 0 };

        let mut watcher = state.watcher.lock().unwrap();
        watcher.current_cpu = Some(current_cpu.clone());

        let summary = Summary {
            cpu: Some(current_cpu),
            cpu_aggregated: None,
            memory: Some(memory),
            swap: Some(swap),
        };

        let try_main_window = app.get_window("main");
        if let Some(main_window) = try_main_window {
            main_window.emit("resourceUpdated", Some(summary)).unwrap();
        }

        // println!("state_list");
        // println!("{:?}", serde_json::to_string(&state_list).unwrap());
    }
}
