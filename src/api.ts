import { invoke } from "@tauri-apps/api/tauri";

import { CPUState, MemoryState, SwapState } from "./types";

export async function getCpuState(ms?: number): Promise<CPUState[]> {
  return await invoke("cpu_state", { ms });
}

export async function getCpuCoreState(core: number, ms?: number): Promise<CPUState> {
  const cores = await getCpuState(ms);
  return cores[core];
}

export async function getCpuStateAggregate(ms?: number): Promise<CPUState> {
  return await invoke("cpu_state_aggregate", { ms });
}

export async function getMemoryState(): Promise<MemoryState> {
  return await invoke("memory_state");
}

export async function getSwapState(): Promise<SwapState> {
  return await invoke("swap_state");
}
