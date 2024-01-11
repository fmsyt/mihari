use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct Config {
    #[serde(default)]
    pub window: Option<WindowConfig>,

    #[serde(default)]
    pub monitor: MonitorConfig,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct WindowConfig {
    pub always_on_top: bool,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
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
            monitor: MonitorConfig::default(),
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
            show_cpu_aggregate_state: true,
            show_memory_state: true,
        }
    }
}
