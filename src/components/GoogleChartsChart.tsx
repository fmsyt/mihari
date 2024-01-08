import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Box } from "@mui/material";

import { Chart } from "react-google-charts";

import ResourceContext from "./ResourceContext";

const defaultHistoryLength = 60;

/**
 * @see https://developers.google.com/chart/interactive/docs?hl=ja
 * @see https://www.react-google-charts.com/examples/area-chart
 * @see https://qiita.com/arakaki_tokyo/items/9f57524df1509837bbec#google-charts
 */
export default function ChartExperimental(props: {
  id: string;
  length?: number;
}) {
  const { length, id: groupId } = props;
  const { resourceGroups, getCurrentValues } = useContext(ResourceContext);

  const [renderChart, setRenderChart] = useState(true);

  // NOTE: プロパティの変更で表示サイズが変わらないので、一旦リサイズイベントで強制的に再レンダリングさせる
  useEffect(() => {
    const onResize = () => {
      setRenderChart(false);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // NOTE: プロパティの変更で表示サイズが変わらないので、一旦リサイズイベントで強制的に再レンダリングさせる
  useLayoutEffect(() => setRenderChart(true), [renderChart])

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
    <Box width="100%" height="100%">
      {renderChart && (
        <Chart
          chartType="AreaChart"
          data={data}
          width="100%"
          height="100%"
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
              left: 1,
              right: 1,
              bottom: 0,
            },
          }}
        />
      )}
    </Box>
  );
}
