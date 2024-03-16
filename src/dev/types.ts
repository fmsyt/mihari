import { ReactNode } from "react";
import { ChartResourceType } from "../types";

export interface ChartProviderProps {
  children?: ReactNode;
  id: string;
  label: string;
  lines: ChartLine[];
  historyLength?: number;
  initialValue?: number;
  incomingDeltas: Delta[];
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


export interface ChartContextResourceCurrent {
  id: string;
  value: number;
}

export interface ChartContextType<T> {
  id: string;
  label: string;
  resources: ChartResourceType<T>[];
  getCurrent: () => number[];
  insert: (deltas: Delta[]) => void;
}

export interface Delta {
  id: string;
  value: number;
  label?: string;

  min?: number;
  max?: number;
  color?: string;
}

export interface ResourceUpdatedPayloadRow {
  chart_id: string;
  delta: Delta[];
}

export type UpdateResourceEventPayload = ResourceUpdatedPayloadRow[];

