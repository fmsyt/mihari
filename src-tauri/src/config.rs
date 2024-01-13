use std::{path::PathBuf, fs};

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct Config {
    pub window: Option<WindowConfig>,
    pub monitor: MonitorConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct WindowConfig {
    pub always_on_top: bool,
    pub decoration: bool,
    pub theme: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct MonitorConfig {
    pub cpu: CpuConfig,
    pub memory: MemoryConfig,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct CpuConfig {
    pub show: bool,
    pub label: Option<String>,
    pub show_aggregated: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct MemoryConfig {
    pub show: bool,
    pub label: Option<String>,
}





impl Default for Config {
    fn default() -> Self {
        Self {
            window: Some(WindowConfig::default()),
            monitor: MonitorConfig::default(),
        }
    }
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            always_on_top: true,
            decoration: false,
            theme: None,
        }
    }
}

impl Default for MonitorConfig {
    fn default() -> Self {
        Self {
            cpu: CpuConfig::default(),
            memory: MemoryConfig::default(),
        }
    }
}

impl Default for CpuConfig {
    fn default() -> Self {
        Self {
            show: true,
            show_aggregated: false,
            label: Some("CPU".to_string()),
        }
    }
}

impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            show: true,
            label: Some("Mem".to_string()),
        }
    }
}


pub trait Storage<T> {
    fn load(path: PathBuf) -> T;
}

impl Storage<Config> for Config {
    fn load(path: PathBuf) -> Config {
        let try_load = fs::read_to_string(path);
        if let Err(_) = try_load {
            eprintln!("Failed to load config.json: {:#?}", try_load);
            return Config::default();
        }

        let config_text = try_load.unwrap();
        let try_json: Result<Self, serde_json::Error> = serde_json::from_str(&config_text);

        if let Err(_) = try_json {
            eprintln!("Failed to parse config.json: {:#?}", try_json);
            return Config::default();
        }

        try_json.unwrap()
    }
}
