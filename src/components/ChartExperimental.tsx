import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";

import { Chart } from "react-google-charts";

import ResourceContext from "./ResourceContext";

const defaultHistoryLength = 60;

interface ChartSize {
  width?: number | string;
  height?: number | string;
}

/**
 * @see https://developers.google.com/chart/interactive/docs?hl=ja
 * @see https://www.react-google-charts.com/examples/area-chart
 * @see https://qiita.com/arakaki_tokyo/items/9f57524df1509837bbec#google-charts
 */
export default function ChartExperimental(props: { id: string; length?: number }) {
  const { length, id: groupId } = props;
  const { resourceGroups, getCurrentValues } = useContext(ResourceContext);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ChartSize>({});

  useEffect(() => {

    const onResize = () => {
      if (!wrapperRef.current) {
        return;
      }

      const { width, height } = wrapperRef.current.getBoundingClientRect();
      const next: ChartSize = {
        width: `${width}px`, // `${width}px`,
        height: `${height}px`, // `${height}px`,
      };

      // console.log("onResize", next);
      setSize(next);

    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    }
  }, []);

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

  const [historyLength, setHistoryLength] = useState(defaultHistoryLength);
  useLayoutEffect(() => {
    setHistoryLength(length || defaultHistoryLength);
  }, [length]);

  const headerRow = useMemo(
    () => resourceGroup.resources.map((r) => r.label) || [],
    [resourceGroup],
  );

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

  const data = useMemo(() => {
    const nextData = [
      ["index", ...headerRow],
      ...rows.map((row, _i) => ["", ...row]),
    ];
    return nextData;

  }, [headerRow, rows]);

  return (
    <Box
      ref={wrapperRef}
      width="100%"
      height="100%"
    >
      <Chart
        chartType="AreaChart"
        data={data}
        width={size.width || "100%"}
        height={size.height || "100%"}
        // width="100%"
        // height="100px"
        // legendToggle
        options={{
          vAxis: {
            minValue: 0,
            maxValue: 100,
            // ticks: [25, 50, 75],
            ticks: [],
          },
          legend: {
            position: "none",
            textStyle: {
              color: "white",
            },
          },
          backgroundColor: "transparent",
          chartArea: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
        }}
      />
    </Box>
  );
}
