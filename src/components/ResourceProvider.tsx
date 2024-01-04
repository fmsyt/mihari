import { ReactNode, useCallback, useLayoutEffect, useState } from "react";

import ResourceContext from "./ResourceContext";
import { Resource, ResourceGroup } from "../types";

interface ResourceProviderProps {
  children: ReactNode;
  groups?: ResourceGroup[];
}

type UpdateHandler = Resource["updateHandler"];

interface currentValuesType {
  id: string;
  handler: UpdateHandler;
}

export default function ResourceProvider(props: ResourceProviderProps) {
  const [updateInterval, setUpdateInterval] = useState(1000);

  const [currentMap, setCurrentMap] = useState<currentValuesType[]>([]);
  const [groups, setGroups] = useState<ResourceGroup[]>([]);

  const addGroup = (group: ResourceGroup) => {
    setGroups((prev) => [...prev, group]);
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const timerDependencies = groups.map((g) => g.id);

  const update = useCallback(async () => {
    // NOTE: 同じメモリを参照させることで、Promise.allの結果を待つタイミングを揃える
    const promiseList: UpdateHandler[] = [];

    const map: currentValuesType[] = groups
      .map((g) => {
        return g.resources.map((r) => {
          promiseList.push(r.updateHandler);

          return {
            id: g.id,
            handler: r.updateHandler,
          };
        });
      })
      .flat();

    const delay = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, updateInterval);
    });

    await Promise.all([delay, ...promiseList]);

    setCurrentMap(map);
  }, [...timerDependencies, updateInterval]);

  useLayoutEffect(() => {
    update();
  }, [update, currentMap]);

  const nextResources = useCallback(
    async (id: string) => {
      const next = currentMap.filter((m) => m.id === id);
      const nextValues = await Promise.all(next.map((n) => n.handler()));

      return nextValues;
    },
    [currentMap],
  );

  return (
    <ResourceContext.Provider
      value={{
        resourceGroups: groups,
        addResourceGroup: addGroup,
        removeResourceGroup: removeGroup,
        updateInterval,
        nextResources,
        setUpdateInterval: (interval: number) => {
          setUpdateInterval(interval);
        },
      }}
    >
      {props.children}
    </ResourceContext.Provider>
  );
}
