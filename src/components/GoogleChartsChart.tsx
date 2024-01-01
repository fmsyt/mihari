import { useLayoutEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";

import { ChartProps, TData } from "./Chart";

const defaultHistoryLength = 60;

// const sampleData = [
//   ["Year", "Sales", "Expenses"],
//   ["2013", 1000, 400],
//   ["2014", 1170, 460],
//   ["2015", 660, 1120],
//   ["2016", 1030, 540],
// ];

/**
 * @see https://developers.google.com/chart/interactive/docs?hl=ja
 * @see https://www.react-google-charts.com/examples/area-chart
 * @see https://qiita.com/arakaki_tokyo/items/9f57524df1509837bbec#google-charts
 */
export default function GoogleChartsChart(props: ChartProps<TData>) {
  const { length, series } = props;

  const [historyLength, setHistoryLength] = useState(defaultHistoryLength);
  useLayoutEffect(() => {
    setHistoryLength(length || defaultHistoryLength);
  }, [length]);

  const headerRow = useMemo(() => series?.map((s) => s.label) || [], [series]);

  const [rows, setRows] = useState<TData[][]>([]);
  useLayoutEffect(() => {
    const timer = setInterval(async () => {
      const nextValues = await Promise.all(
        series?.map((s) => s.handleUpdate()) || [],
      );

      setRows((prev) => {
        const next = [...prev, nextValues];

        next.shift();

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [series]);

  useLayoutEffect(() => {
    const defaultRows = Array(series?.length)
      .fill(0)
      .map((_) => 0);
    const nextSeries = Array(historyLength)
      .fill(0)
      .map((_) => defaultRows);

    setRows(nextSeries);
  }, [series, historyLength]);

  return (
    <Chart
      chartType="AreaChart"
      data={[["index", ...headerRow], ...rows.map((row) => ["", ...row])]}
      width="100%"
      height="100%"
      legendToggle
      options={{
        vAxis: {
          minValue: 0,
          maxValue: 100,
        },
        legend: {
          position: "top",
          textStyle: {
            color: "white",
          },
        },
        backgroundColor: "transparent",
        // colors: ["#ff0000", "#00ff00", "#0000ff"],
        chartArea: {
          top: 48,
          left: 48,
          right: 48,
          bottom: 48,
        },
      }}
    />
  );
}
