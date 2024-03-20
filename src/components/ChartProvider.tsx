import { useEffect, useMemo, useState } from "react";
import { ChartContextResource, ChartContextValuesType, ChartLineDelta, ChartProviderProps } from "../types";
import ChartContext from "./ChartContext";

function fillArray<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}


export default function ChartProvider(props: ChartProviderProps) {

  const { children, id, label, lines, initialValue, historyLength, incomingDeltas } = props;
  const [resources, setResources] = useState<ChartContextResource[]>([]);

  const [currentIncomingDeltas, setCurrentIncomingDeltas] = useState<ChartLineDelta[]>([]);


  useEffect(() => {

    const contextResources: ChartContextResource[] = lines.map((info) => {
      return {
        id: info.id,
        label: info.label,
        values: fillArray(historyLength || 60, initialValue || 0),
      }
    })

    setResources(contextResources);

  }, [lines, initialValue, historyLength])


  useEffect(() => {
    setCurrentIncomingDeltas(incomingDeltas);

    const next = [...resources];
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

    setResources(next);

  }, [incomingDeltas])


  const currentLineValues = useMemo(() => currentIncomingDeltas.map((param) => param.value), [currentIncomingDeltas])
  const currentLineRaws = useMemo(() => currentIncomingDeltas.map((param) => param.raw), [currentIncomingDeltas])

  const value: ChartContextValuesType = {
    id,
    label,
    currentLineValues,
    resources,
    currentLineRaws
  }

  return (
    <ChartContext.Provider value={value}>
      {children}
    </ChartContext.Provider>
  )
}
