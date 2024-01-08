import { createContext } from "react";

import { ResourceGroup } from "../types";

interface Context {
  resourceGroups: ResourceGroup[];
  updateInterval: number;
  getGroup: (id: string) => ResourceGroup | undefined;
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
