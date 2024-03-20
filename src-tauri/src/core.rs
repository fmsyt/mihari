use std::sync::{Arc, Mutex};

use serde::Serialize;
use tauri::{async_runtime::JoinHandle, AppHandle, Manager};
use tokio::sync::MutexGuard;

use crate::{
    config::Config,
    resource::{
        measure_cpu_state, measure_memory_state, measure_swap_state, CPUState, MemoryState,
        SwapState,
    },
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
pub struct ResourceUpdatedPayload {
    pub cpu: Option<ChartLineDelta<CPUState>>,
    pub memory: Option<ChartLineDelta<MemoryState>>,
    pub swap: Option<ChartLineDelta<SwapState>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(default, rename_all = "camelCase")]
pub struct ChartLineDelta<T> {
    pub chart_id: String,
    pub delta: Vec<ChartLine<T>>,
}


#[derive(Debug, Clone, Serialize)]
#[serde(default, rename_all = "camelCase")]
pub struct ChartLine<T> {
    pub id: String,
    pub label: String,
    pub value: f32,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw: Option<T>,
}


impl From<Vec<CPUState>> for ChartLineDelta<CPUState> {
    fn from(payload: Vec<CPUState>) -> Self {
        let mut delta = Vec::new();
        for (i, cpu) in payload.iter().enumerate() {

            let data: ChartLine<CPUState> = ChartLine {
                id: format!("core_{}", i),
                label: format!("Core {}", i + 1),
                value: 100.0 - cpu.idle * 100.0,
                raw: Some(cpu.clone()),
            };

            delta.push(data);
        }

        Self {
            chart_id: "cpu".to_string(),
            delta,
        }
    }
}

impl From<MemoryState> for ChartLineDelta<MemoryState> {
    fn from(payload: MemoryState) -> Self {
        let mut delta = Vec::new();

        if payload.total == 0 {
            return Self {
                chart_id: "memory".to_string(),
                delta,
            };
        }

        let value = (1.0 - payload.free as f32 / payload.total as f32) * 100.0;

        delta.push(ChartLine {
            id: "memory".to_string(),
            label: "Memory".to_string(),
            value,
            raw: Some(payload),
        });

        Self {
            chart_id: "memory".to_string(),
            delta,
        }
    }
}

impl From<SwapState> for ChartLineDelta<SwapState> {
    fn from(payload: SwapState) -> Self {
        let mut delta = Vec::new();

        if payload.total == 0 {
            return Self {
                chart_id: "swap".to_string(),
                delta,
            };
        }

        let value = (1.0 - payload.free as f32 / payload.total as f32) * 100.0;

        delta.push(ChartLine {
            id: "swap".to_string(),
            label: "Swap".to_string(),
            value,
            raw: Some(payload),
        });

        Self {
            chart_id: "swap".to_string(),
            delta,
        }
    }
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
        let payload = tick(state).await;

        let try_main_window = app.get_window("main");
        if let Some(main_window) = try_main_window {
            main_window.emit("resourceUpdated", payload).unwrap();
        }

        // println!("state_list");
        // println!("{:?}", serde_json::to_string(&state_list).unwrap());
    }
}

pub async fn tick(state: MutexGuard<'_, AppState>) -> ResourceUpdatedPayload {

    let ms = state.config.lock().unwrap().monitor.update_interval;
    let current_cpu = measure_cpu_state(ms).await;
    let memory = measure_memory_state();
    let swap = measure_swap_state();

    let payload = ResourceUpdatedPayload {
        cpu: Some(current_cpu.clone().into()),
        memory: Some(memory.into()),
        swap: Some(swap.into()),
    };

    let mut watcher = state.watcher.lock().unwrap();
    watcher.current_cpu = Some(current_cpu.clone());

    payload
}
