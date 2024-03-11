import { createContext } from "react";

import { ChartType } from "../types";

interface Context {
  resourceGroups: ChartType[];
  updateInterval: number;
  getGroup: (id: string) => ChartType | undefined;
  getCurrentValues: (id: string) => number[];
  getCurrentRawValues: (id: string) => any[];
}

const ResourceContext = createContext<Context>({
  resourceGroups: [],
  updateInterval: 1000,
  getGroup: () => undefined,
  getCurrentValues: () => [],
  getCurrentRawValues: () => [],
});

export default ResourceContext;
