use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct Config {
    pub window: Option<WindowConfig>,
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
    pub cpu: CpuConfig,
    pub memory: MemoryConfig,
}


#[derive(Serialize, Deserialize, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct CpuConfig {
    pub show: bool,
    pub label: Option<String>,
    pub show_aggregated: bool,
}

#[derive(Serialize, Deserialize, Clone)]
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
