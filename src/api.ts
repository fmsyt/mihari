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

export async function getCpuState(): Promise<CPUState> {
  return await invoke("cpu_state");
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
