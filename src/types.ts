import type { ReactNode } from "react"

export interface AppConfig {
  window: WindowState
  monitor: MonitorConfig
}

export interface WindowState {
  theme: "light" | "dark" | null
  alwaysOnTop: boolean
  decoration: boolean
}

export const MonitorKeys = ["cpu", "memory", "swap", "gpu"] as const
export type MonitorKey = (typeof MonitorKeys)[number]

export interface MonitorConfig {
  /** @type number Update interval in milliseconds */
  updateInterval: number
  resource: {
    cpu: CpuConfig
    memory: MemoryConfig
    swap: SwapConfig
    gpu: GpuConfig
  }
}

export interface MonitorResourceConfig {
  show: boolean
  label: string
}

export function isMonitorResourceConfig(
  // biome-ignore lint/suspicious/noExplicitAny: type guard
  obj: any,
): obj is MonitorResourceConfig {
  if (typeof obj !== "object") {
    return false
  }

  if (typeof obj.show !== "boolean") {
    return false
  }

  if (typeof obj.label !== "string") {
    return false
  }

  return true
}

export interface CpuConfig extends MonitorResourceConfig {
  showAggregated: boolean
  excludeIdle: boolean
}

export interface MemoryConfig extends MonitorResourceConfig {}

export interface SwapConfig extends MonitorResourceConfig {}

export interface GpuConfig extends MonitorResourceConfig {}

export interface CPUState {
  system: number
  user: number
  nice: number
  idle: number
  interrupt: number
}

export interface MemoryState {
  total: number
  used: number
}

export interface SwapState {
  total: number
  used: number
}

export interface GpuState {
  id: string
  label: string
  usage: number
}

export type ResourceState = CPUState | MemoryState | SwapState | GpuState

export interface ChartProviderProps {
  children?: ReactNode
  id: MonitorKey
  label: string
  lines: ChartLine[]
  historyLength?: number
  initialValue?: number
  incomingDeltas: ChartLineDelta[]
}

export interface ChartLine {
  id: string
  label: string
  min?: number
  max?: number
  color?: string
}

export interface ChartContextValuesType {
  id: MonitorKey
  label: string
  resources: ChartContextResource[]
  currentLineValues: number[]
  currentLineRaws: ResourceState[]
}

export interface ChartContextResource {
  id: string
  label: string
  values: number[]
}

// biome-ignore lint/suspicious/noExplicitAny: chart payload raw values differ by resource
export interface ChartLineDelta<T = any> extends ChartLine {
  value: number
  raw: T
}

// biome-ignore lint/suspicious/noExplicitAny: chart payload rows are specialized by resource
export interface ResourceUpdatedPayloadRow<T = any> {
  chartId: MonitorKey
  delta: ChartLineDelta<T>[]
}

export interface UpdateResourceEventPayload {
  cpu?: ResourceUpdatedPayloadRow<CPUState>
  memory?: ResourceUpdatedPayloadRow<MemoryState>
  swap?: ResourceUpdatedPayloadRow<SwapState>
  gpu?: ResourceUpdatedPayloadRow<GpuState>
}
