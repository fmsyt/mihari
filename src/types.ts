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

export interface ChartResourceType<T> {
  id?: string;
  label: string;
  updateHandler: () => Promise<T>;
  min?: number;
  max?: number;
  color?: string;
  toValue?: (value: T) => number;
}

export interface ChartType {
  id: string;
  label: string;
  resources: ChartResourceType<any>[];
  monitorLabelComponent?: ({ values, rawValues }: { values: any[], rawValues: any[] }) => ReactNode;
}

export type UpdateResourceEventPayload = ResourceUpdatedPayloadRow[];

export interface ResourceUpdatedPayloadRow {
  id: string;
  delta: ChartResourceType<ResourceState>[];
}
