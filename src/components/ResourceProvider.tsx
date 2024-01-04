import { ReactNode, useCallback, useLayoutEffect, useState } from "react";

import ResourceContext from "./ResourceContext";
import { Resource, ResourceGroup } from "../types";

interface ResourceProviderProps {
  children: ReactNode;
}

type UpdateHandler = () => Promise<Resource<any>[]>;
interface updateHandlerMapType {
  timer: Promise<void>;
  handlers: {
    [key: string]: UpdateHandler;
  };
}

const defaultUpdateHandlerMap: updateHandlerMapType = {
  timer: Promise.resolve(),
  handlers: {},
};

export default function ResourceProvider(props: ResourceProviderProps) {
  const [updateInterval, setUpdateInterval] = useState(1000);

  const [groups, setGroups] = useState<ResourceGroup[]>([]);

  const addGroup = (group: ResourceGroup) => {
    setGroups((prev) => [...prev, group]);
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const [updateHandlerMap, setUpdateHandlerMap] =
    useState<updateHandlerMapType>(defaultUpdateHandlerMap);

  const timerDependencies = groups.map((g) => g.id);

  useLayoutEffect(() => {
    const timer = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, updateInterval);
    });

    const handlers: { [key: string]: UpdateHandler } = {};

    groups.forEach((group) => {
      group.resources.forEach((resource) => {
        handlers[resource.id] = resource.updateHandler;
      });
    });

    setUpdateHandlerMap({ timer, handlers });
  }, [...timerDependencies, updateInterval]);

  const nextResources = useCallback(
    async (id: string) => {
      const handler = updateHandlerMap.handlers[id];

      if (!handler) {
        return Promise.reject(`Resource with id ${id} not found`);
      }

      const [value] = await Promise.all([handler(), updateHandlerMap.timer]);

      return value;
    },
    [updateHandlerMap],
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
