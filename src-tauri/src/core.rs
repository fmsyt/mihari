use std::sync::{Arc, Mutex};

use tauri::async_runtime::JoinHandle;

use crate::{config::Config, commands::CPUState};

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
