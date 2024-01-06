import { invoke } from "@tauri-apps/api/tauri";

const handlerNameList = ["cpu_state", "memory_state"] as const;

export type HandlerName = (typeof handlerNameList)[number];

export interface CPUState {
  system: number;
  user: number;
  nice: number;
  idle: number;
  interrupt: number;
}

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

export interface MemoryState {
  total: number;
  free: number;
  used: number;
  active: number;
  available: number;
}

export async function getMemoryState(): Promise<MemoryState> {
  return await invoke("memory_state");
}

export interface SwapState {
  total: number;
  free: number;
}

export async function getSwapState(): Promise<SwapState> {
  return await invoke("swap_state");
}
