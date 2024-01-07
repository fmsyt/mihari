import { createContext } from "react";

import { ResourceGroup } from "../types";

interface Context {
  resourceGroups: ResourceGroup[];
  updateInterval: number;
  getCurrentValues: (id: string) => number[];
  getCurrentRawValues: (id: string) => any[];
}

const ResourceContext = createContext<Context>({
  resourceGroups: [],
  updateInterval: 1000,
  getCurrentValues: () => [],
  getCurrentRawValues: () => [],
});

export default ResourceContext;
