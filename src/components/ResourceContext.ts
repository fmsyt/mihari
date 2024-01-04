import { createContext } from "react";

import { ResourceGroup } from "../types";

interface Context<T> {
  resourceGroups: ResourceGroup[];
  addResourceGroup: (resourceGroup: ResourceGroup) => void;
  removeResourceGroup: (id: string) => void;
  updateInterval: number;
  nextResources: (id: string) => Promise<T[]>;
  setUpdateInterval: (interval: number) => void;
}

const ResourceContext = createContext<Context<number>>({
  resourceGroups: [],
  addResourceGroup: () => {},
  removeResourceGroup: () => {},
  updateInterval: 1000,
  nextResources: () => Promise.resolve([0]),
  setUpdateInterval: () => {},
});

export default ResourceContext;
