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
  rawValues: any[];
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
    const promiseList = groups.map((g) => {
      return Promise.all(g.resources.map(async (r) => {
        const data = await r.updateHandler();
        return {
          raw: data,
          value: r.toValue ? r.toValue(data) : data
        }
      }));
    })

    const delay = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, updateInterval);
    });

    const [, ...resolved] = await Promise.all([delay, ...promiseList]);
    const nextCurrentValues = resolved.map((data, i) => {
      return {
        id: groups[i].id,
        values: data.map((vv) => vv.value),
        rawValues: data.map((vv) => vv.raw),
      } as currentValuesType;
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
  const getCurrentRawValues = useCallback((id: string) => currentValues.find((v) => v.id === id)?.rawValues || [], [currentValues]);

  return (
    <ResourceContext.Provider
      value={{
        resourceGroups: groups,
        updateInterval,
        getCurrentValues,
        getCurrentRawValues,
      }}
    >
      {props.children}
    </ResourceContext.Provider>
  );
}
