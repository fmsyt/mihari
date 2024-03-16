import { useContext, useLayoutEffect, useMemo, useState } from "react";
import WrappedChart from "./GoogleChartsChart";
import ResourceContext from "./ResourceContext";

export type TData = number | string;

export interface SeriesType {
  label: string;
  handleUpdate: () => TData | Promise<TData>;
}

export interface ChartProps {
  id: string;
  length?: number;
}

const defaultHistoryLength = 60;

export const Chart = (props: ChartProps) => {
  const { length, id: groupId } = props;

  const { resourceGroups, getCurrentValues } = useContext(ResourceContext);

  const resourceGroup = useMemo(() => {
    const group = resourceGroups?.find((g) => g.id === groupId);
    if (!group) {
      return {
        id: groupId,
        label: groupId,
        resources: [],
      };
    }

    return group;
  }, [resourceGroups, groupId]);

  const headerRow = useMemo(() => resourceGroup.resources.map((r) => r.label) || [], [resourceGroup]);

  const [historyLength, setHistoryLength] = useState(defaultHistoryLength);
  useLayoutEffect(() => {
    setHistoryLength(length || defaultHistoryLength);
  }, [length]);

  const [rows, setRows] = useState<number[][]>([]);
  useLayoutEffect(() => {
    const defaultRows = Array(resourceGroup.resources.length)
      .fill(0)
      .map((_) => 0);

    const nextSeries = Array(historyLength)
      .fill(0)
      .map((_) => defaultRows);

    setRows(nextSeries);
  }, [resourceGroup, historyLength]);

  console.table({
    headerRow,
    rows,
  })

  useLayoutEffect(() => {
    const nextValues = getCurrentValues(groupId);
    if (nextValues.length !== resourceGroup.resources.length) {
      return;
    }

    setRows((prev) => {
      const next = [...prev];

      next.push(nextValues);
      next.shift();

      return next;
    });
  }, [getCurrentValues, groupId, resourceGroup]);

  return (
    <WrappedChart
      headerRow={headerRow}
      rows={rows}
    />
  );
}
