import { invoke } from "@tauri-apps/api/tauri";

import { AppConfig, CPUState, MemoryState, SwapState } from "./types";

export async function getAppConfig(): Promise<AppConfig> {
  return await invoke("get_app_config");
}

export async function getCpuState(): Promise<CPUState[]> {
  return await invoke("cpu_state");
}

export async function getCpuCoreState(core: number): Promise<CPUState> {
  const cores = await getCpuState();
  return cores[core];
}

export async function getCpuStateAggregate(): Promise<CPUState> {
  const cores = await getCpuState();
  const averaged = cores.reduce(
    (prev, cur) => {
      prev.user += cur.user;
      prev.nice += cur.nice;
      prev.system += cur.system;
      prev.idle += cur.idle;
      prev.interrupt += cur.interrupt;

      return prev;
    },
    { user: 0, nice: 0, system: 0, idle: 0, interrupt: 0 } as CPUState
  );

  const aggregate = {
    user: averaged.user / cores.length,
    nice: averaged.nice / cores.length,
    system: averaged.system / cores.length,
    idle: averaged.idle / cores.length,
    interrupt: averaged.interrupt / cores.length,
  };

  return aggregate;
}

export async function getMemoryState(): Promise<MemoryState> {
  return await invoke("memory_state");
}

export async function getSwapState(): Promise<SwapState> {
  return await invoke("swap_state");
}

export async function startWatchResourceLegacy(): Promise<void> {
  return await invoke("watch_legacy");
}

export async function startWatchResource(): Promise<void> {
  return await invoke("start_watch");
}
