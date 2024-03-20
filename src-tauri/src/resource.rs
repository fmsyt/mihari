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
    pub free: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct SwapState {
    pub total: u64,
    pub free: u64,
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

pub fn measure_memory_state() -> MemoryState {
    let sys = System::new();
    let memory = sys.memory().unwrap();

    MemoryState {
        total: memory.total.as_u64(),
        free: memory.free.as_u64(),
    }
}

/// @see https://learn.microsoft.com/ja-jp/windows/win32/cimwin32prov/win32-pagefileusage
/// @see https://learn.microsoft.com/ja-jp/windows/win32/api/winbase/ns-winbase-memorystatus
/// @see https://learn.microsoft.com/ja-jp/windows/win32/api/sysinfoapi/ns-sysinfoapi-memorystatusex
pub fn measure_swap_state() -> SwapState {
    let sys = System::new();
    let swap = sys.swap().unwrap();

    let total = swap.total.as_u64();
    let free = swap.free.as_u64();

    #[cfg(target_os = "windows")]
    {
        // NOTE: `free`の値は物理メモリと仮想メモリの両方の値を含む。`0`の場合は仮想メモリを使用していないとみなす。
        if free == 0 {
            return SwapState { total, free: total };
        }
    }

    SwapState { total, free }
}
