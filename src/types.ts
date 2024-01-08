export interface CPUState {
  system: number;
  user: number;
  nice: number;
  idle: number;
  interrupt: number;
}
export interface MemoryState {
  total: number;
  free: number;
  used: number;
  active: number;
  available: number;
}
export interface SwapState {
  total: number;
  free: number;
}

export type ResourceState = CPUState | MemoryState | SwapState;

export interface Resource<T extends ResourceState> {
  label: string;
  updateHandler: () => T | Promise<T>;
  min?: number;
  max?: number;
  color?: string;
  toValue?: (value: T) => number;
}

export interface ResourceGroup {
  id: string;
  label: string;
  resources: Resource<any>[];
}
