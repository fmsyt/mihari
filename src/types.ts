import { ReactNode } from "react";

export interface AppConfig {
  window: WindowState;
  monitor: MonitorConfig;
}

export interface WindowState {
  theme: "light" | "dark" | null;
  alwaysOnTop: boolean;
  decoration: boolean;
}

export const MonitorKeys = ["cpu", "memory", "swap"] as const;
export type MonitorKey = typeof MonitorKeys[number];

export interface MonitorConfig {
  /** @type number Update interval in milliseconds */
  updateInterval: number;
  cpu: CpuConfig;
  memory: MemoryConfig;
  swap: SwapConfig;
}

export interface MonitorConfig {
  show: boolean;
  label: string;
}

export function isMonitorConfig(obj: any): obj is MonitorConfig {
  if (typeof obj !== "object") {
    return false;
  }

  if (typeof obj.show !== "boolean") {
    return false;
  }

  if (typeof obj.label !== "string") {
    return false;
  }

  return true;
}

export interface CpuConfig extends MonitorConfig {
  showAggregated: boolean;
  excludeIdle: boolean;
}

export interface MemoryConfig extends MonitorConfig { }

export interface SwapConfig extends MonitorConfig { }

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
}

export interface SwapState {
  total: number;
  free: number;
}

export type ResourceState = CPUState | MemoryState | SwapState;



export interface ChartProviderProps {
  children?: ReactNode;
  id: MonitorKey;
  label: string;
  lines: ChartLine[];
  historyLength?: number;
  initialValue?: number;
  incomingDeltas: ChartLineDelta[];
}

export interface ChartLine {
  id: string;
  label: string;
  min?: number;
  max?: number;
  color?: string;
}



export interface ChartContextValuesType {
  id: MonitorKey;
  label: string;
  resources: ChartContextResource[];
  currentLineValues: number[];
  currentLineRaws: ResourceState[];
}

export interface ChartContextResource {
  id: string;
  label: string;
  values: number[];
}

export interface ChartLineDelta<T = any> extends ChartLine {
  value: number;
  raw: T;
}

export interface ResourceUpdatedPayloadRow<T = any> {
  chartId: MonitorKey;
  delta: ChartLineDelta<T>[];
}

export interface UpdateResourceEventPayload {
  cpu?: ResourceUpdatedPayloadRow<CPUState>,
  memory?: ResourceUpdatedPayloadRow<MemoryState>,
  swap?: ResourceUpdatedPayloadRow<SwapState>,
}
