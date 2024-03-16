import { useEffect, useLayoutEffect, useState } from "react";
import ChartContext from "./ChartContext";
import { ChartContextResource, ChartContextValuesType, ChartProviderProps } from "./types";

function fillArray<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}


export default function ChartProvider(props: ChartProviderProps) {

  const { children, id, label, lines, initialValue, historyLength, incomingDeltas } = props;
  const [contextResources, setContextResources] = useState<ChartContextResource[]>([]);
  const [currentLineValues, setCurrentLineValues] = useState<number[]>([]);

  useEffect(() => {

    const contextResources: ChartContextResource[] = lines.map((info) => {
      return {
        id: info.id,
        label: info.label,
        values: fillArray(historyLength || 60, initialValue || 0),
      }
    })

    setContextResources(contextResources);

  }, [lines, initialValue, historyLength])


  useLayoutEffect(() => {

    const currentValues = incomingDeltas.map((param) => param.value);

    setCurrentLineValues(currentValues);

    const next = [...contextResources];
    incomingDeltas.forEach((delta) => {
      let resource = next.find((resource) => resource.id === delta.id);
      if (!resource) {
        resource = {
          id: delta.id,
          label: delta.label || delta.id,
          values: fillArray(historyLength || 60, initialValue || 0),
        }

        next.push(resource);
      }

      resource.values = [...resource.values.slice(1), delta.value];
    })

    setContextResources(next);

  }, [incomingDeltas])

  const value: ChartContextValuesType = {
    id,
    label,
    currentLineValues: currentLineValues,
    resources: contextResources,
  }

  return (
    <ChartContext.Provider value={value}>
      {children}
    </ChartContext.Provider>
  )
}
