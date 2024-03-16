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

export interface MonitorConfig {
  /** @type number Update interval in milliseconds */
  updateInterval: number;
  cpu: CpuConfig;
  memory: MemoryConfig;
}

export interface CpuConfig {
  show: boolean;
  showAggregated: boolean;
  label: string;
  excludeIdle: boolean;
}

export interface MemoryConfig {
  show: boolean;
  label: string;
}

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



export interface ChartProviderProps {
  children?: ReactNode;
  id: string;
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
  id: string;
  label: string;
  resources: ChartContextResource[];
  currentLineValues: number[];
}

export interface ChartContextResource {
  id: string;
  label: string;
  values: number[];
}

export interface ChartLineDelta extends ChartLine {
  value: number;
}

export interface ResourceUpdatedPayloadRow {
  chart_id: string;
  delta: ChartLineDelta[];
}

export type UpdateResourceEventPayload = ResourceUpdatedPayloadRow[];
