import { ReactNode, useCallback, useLayoutEffect, useState } from "react";

import ResourceContext from "./ResourceContext";
import { ResourceGroup } from "../types";

interface ResourceProviderProps {
  children: ReactNode;
  groups?: ResourceGroup[];
  updateInterval?: number;
}

interface currentValuesType {
  id: string;
  values: number[];
}

export default function ResourceProvider(props: ResourceProviderProps) {
  const { groups: initialGroups = [] } = props;
  const [groups, setGroups] = useState<ResourceGroup[]>(initialGroups);
  useLayoutEffect(() => {
    setGroups(initialGroups || []);
  }, [initialGroups]);

  const [updateInterval, setUpdateInterval] = useState(1000);
  useLayoutEffect(() => {
    setUpdateInterval(props.updateInterval || 1000);
  }, [props.updateInterval]);

  const [currentValues, setCurrentValues] = useState<currentValuesType[]>([]);

  const update = useCallback(async () => {

    // NOTE: 同じメモリを参照させることで、Promise.allの結果を待つタイミングを揃える
    const promiseList: Promise<number[]>[] = [];

    const map = groups.map((g) => {
      const promise = Promise.all(g.resources.map((r) => r.updateHandler()));
      promiseList.push(promise);

      return {
        id: g.id,
        promise,
      };
    });

    const delay = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, updateInterval);
    });

    const [, ...values] = await Promise.all([delay, ...promiseList]);
    const nextCurrentValues = values.map((v, i) => {
      return {
        id: map[i].id,
        values: v,
      };
    });

    setCurrentValues(nextCurrentValues);
  }, [groups, updateInterval]);

  useLayoutEffect(() => {

    const timer = setInterval(update, updateInterval);

    return () => {
      clearInterval(timer);
    };

  }, [update, updateInterval]);

  const getCurrentValues = useCallback((id: string) => currentValues.find((v) => v.id === id)?.values || [], [currentValues]);

  return (
    <ResourceContext.Provider
      value={{
        resourceGroups: groups,
        updateInterval,
        getCurrentValues,
      }}
    >
      {props.children}
    </ResourceContext.Provider>
  );
}
