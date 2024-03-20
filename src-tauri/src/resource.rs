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
