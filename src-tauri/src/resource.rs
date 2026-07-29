use serde::Serialize;
use std::time::Duration;
use systemstat::{Platform, System};

#[derive(Debug, Clone, Serialize)]
pub struct CPUState {
    pub system: f32,
    pub user: f32,
    pub nice: f32,
    pub idle: f32,
    pub interrupt: f32,
}

pub type CPUCoresState = Vec<CPUState>;
pub type CPUStateAggregated = CPUState;

impl From<CPUCoresState> for CPUStateAggregated {
    fn from(cpu_state: CPUCoresState) -> Self {
        let state = cpu_state.iter().fold(
            CPUState {
                system: 0.0,
                user: 0.0,
                nice: 0.0,
                idle: 0.0,
                interrupt: 0.0,
            },
            |acc, state| CPUState {
                system: acc.system + state.system,
                user: acc.user + state.user,
                nice: acc.nice + state.nice,
                idle: acc.idle + state.idle,
                interrupt: acc.interrupt + state.interrupt,
            },
        );

        CPUState {
            system: state.system / cpu_state.len() as f32,
            user: state.user / cpu_state.len() as f32,
            nice: state.nice / cpu_state.len() as f32,
            idle: state.idle / cpu_state.len() as f32,
            interrupt: state.interrupt / cpu_state.len() as f32,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct MemoryState {
    pub total: u64,
    pub used: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct SwapState {
    pub total: u64,
    pub used: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct GpuState {
    pub id: String,
    pub label: String,
    pub usage: f32,
}

pub async fn measure_cpu_state(interval: u64) -> Vec<CPUState> {
    let sys = System::new();
    let cpu = sys.cpu_load().unwrap();

    tokio::time::sleep(Duration::from_millis(interval)).await;

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

pub async fn measure_cpu_state_aggregate(interval: u64) -> CPUStateAggregated {
    let sys = System::new();
    let cpu = sys.cpu_load_aggregate().unwrap();

    tokio::time::sleep(Duration::from_millis(interval)).await;

    let cpu_load = cpu.done().unwrap();

    CPUStateAggregated {
        system: cpu_load.system,
        user: cpu_load.user,
        nice: cpu_load.nice,
        idle: cpu_load.idle,
        interrupt: cpu_load.interrupt,
    }
}

pub fn measure_memory_state(sys: &sysinfo::System) -> MemoryState {
    let total = sys.total_memory();
    let used = sys.used_memory();

    MemoryState { total, used }
}

/// @see https://learn.microsoft.com/ja-jp/windows/win32/cimwin32prov/win32-pagefileusage
/// @see https://learn.microsoft.com/ja-jp/windows/win32/api/winbase/ns-winbase-memorystatus
/// @see https://learn.microsoft.com/ja-jp/windows/win32/api/sysinfoapi/ns-sysinfoapi-memorystatusex
pub fn measure_swap_state(sys: &sysinfo::System) -> SwapState {
    let total = sys.total_swap();
    let used = sys.used_swap();

    SwapState { total, used }
}

pub fn measure_gpu_state() -> Vec<GpuState> {
    let state_list = measure_gpu_state_from_drm_sysfs();
    if !state_list.is_empty() {
        return state_list;
    }

    measure_gpu_state_from_nvidia_smi()
}

#[cfg(target_os = "linux")]
fn measure_gpu_state_from_drm_sysfs() -> Vec<GpuState> {
    use std::{fs, path::Path};

    fn is_drm_card(name: &str) -> bool {
        let Some(card_number) = name.strip_prefix("card") else {
            return false;
        };

        !card_number.is_empty() && card_number.chars().all(|c| c.is_ascii_digit())
    }

    fn read_usage(path: &Path) -> Option<f32> {
        let usage = fs::read_to_string(path).ok()?;
        let usage = usage.trim().parse::<f32>().ok()?;

        Some(usage.clamp(0.0, 100.0))
    }

    let Ok(cards) = fs::read_dir("/sys/class/drm") else {
        return Vec::new();
    };

    let mut state_list = Vec::new();

    for card in cards.flatten() {
        let card_name = card.file_name().to_string_lossy().to_string();
        if !is_drm_card(&card_name) {
            continue;
        }

        let device_path = card.path().join("device");
        let busy_path = device_path.join("gpu_busy_percent");
        if let Some(usage) = read_usage(&busy_path) {
            state_list.push(GpuState {
                id: card_name.clone(),
                label: card_name.clone(),
                usage,
            });

            continue;
        }

        let gt_path = device_path.join("gt");
        let Ok(gt_list) = fs::read_dir(gt_path) else {
            continue;
        };

        for gt in gt_list.flatten() {
            let gt_name = gt.file_name().to_string_lossy().to_string();
            let busy_path = gt.path().join("busy_percent");
            if let Some(usage) = read_usage(&busy_path) {
                state_list.push(GpuState {
                    id: format!("{}_{}", card_name, gt_name),
                    label: format!("{} {}", card_name, gt_name),
                    usage,
                });
            }
        }
    }

    state_list.sort_by(|a, b| a.id.cmp(&b.id));
    state_list
}

#[cfg(not(target_os = "linux"))]
fn measure_gpu_state_from_drm_sysfs() -> Vec<GpuState> {
    Vec::new()
}

fn measure_gpu_state_from_nvidia_smi() -> Vec<GpuState> {
    use std::process::Command;

    let Ok(output) = Command::new("nvidia-smi")
        .args([
            "--query-gpu=index,name,utilization.gpu",
            "--format=csv,noheader,nounits",
        ])
        .output()
    else {
        return Vec::new();
    };

    if !output.status.success() {
        return Vec::new();
    }

    let Ok(stdout) = String::from_utf8(output.stdout) else {
        return Vec::new();
    };

    parse_nvidia_smi_gpu_state(&stdout)
}

fn parse_nvidia_smi_gpu_state(output: &str) -> Vec<GpuState> {
    output
        .lines()
        .filter_map(|line| {
            let columns = line
                .split(',')
                .map(|column| column.trim())
                .collect::<Vec<_>>();
            if columns.len() != 3 {
                return None;
            }

            let usage = columns[2].parse::<f32>().ok()?.clamp(0.0, 100.0);

            Some(GpuState {
                id: format!("nvidia_{}", columns[0]),
                label: columns[1].to_string(),
                usage,
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::parse_nvidia_smi_gpu_state;

    #[test]
    fn parse_nvidia_smi_output() {
        let state_list = parse_nvidia_smi_gpu_state("0, NVIDIA GeForce RTX 4070, 12\n");

        assert_eq!(state_list.len(), 1);
        assert_eq!(state_list[0].id, "nvidia_0");
        assert_eq!(state_list[0].label, "NVIDIA GeForce RTX 4070");
        assert_eq!(state_list[0].usage, 12.0);
    }

    #[test]
    fn clamp_nvidia_smi_usage() {
        let state_list = parse_nvidia_smi_gpu_state("0, NVIDIA GPU, 101\n");

        assert_eq!(state_list[0].usage, 100.0);
    }
}
