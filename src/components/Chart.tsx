import WrappedChart from "./GoogleChartsChart";

export type TData = number | string;

export interface SeriesType {
  label: string;
  handleUpdate: () => TData | Promise<TData>;
}

export interface ChartProps<T extends TData> {
  length?: number;
  label?: string;
  labels?: string[];
  handlers: (() => T | Promise<T>)[];

  series?: SeriesType[];
}

export const Chart = WrappedChart;
