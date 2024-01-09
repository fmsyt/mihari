use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]

pub struct Config {
    #[serde(default)]
    pub window: Option<WindowConfig>,
}

#[derive(Serialize, Deserialize)]
pub struct WindowConfig {
    #[serde(default)]
    pub always_on_top: bool,
}

#[derive(Serialize, Deserialize)]
pub struct MonitorConfig {
    #[serde(default)]
    pub show_cpu_state: bool,

    #[serde(default)]
    pub show_cpu_aggregate_state: bool,

    #[serde(default)]
    pub show_memory_state: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            window: Some(WindowConfig::default()),
        }
    }
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            always_on_top: true,
        }
    }
}

impl Default for MonitorConfig {
    fn default() -> Self {
        Self {
            show_cpu_state: true,
            show_cpu_aggregate_state: false,
            show_memory_state: true,
        }
    }
}
