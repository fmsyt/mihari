import { useLayoutEffect, useState } from "react";

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts/highstock";

import { ChartProps, TData } from "./Chart";

const defaultHistoryLength = 10;

const options: Highcharts.Options = {
  yAxis: {
    min: 0,
    max: 100,
  },
};

export default function HighchartsChart<T extends TData>(props: ChartProps<T>) {
  const { label, length, handlers } = props;

  const [historyLength, setHistoryLength] = useState(defaultHistoryLength);
  const [rows, setRows] = useState<TData[][]>([]);
  useLayoutEffect(() => {
    setHistoryLength(length || defaultHistoryLength);

    const defaultRows = Array(historyLength)
      .fill(0)
      .map((_) => 0);
    const nextSeries = handlers.map((_) => [...defaultRows]);

    setRows(nextSeries);
  }, [length, handlers]);

  useLayoutEffect(() => {
    const timer = setInterval(async () => {
      console.log("timer");

      const nextValues = await Promise.all(handlers.map((h) => h()));

      setRows((prev) => {
        const next = [...prev];
        nextValues.forEach((v, i) => {
          next[i].shift();
          next[i].push(v);
        });

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [handlers]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={{
        ...options,
        title: {
          text: label || "",
        },
        series: rows.map((data) => ({
          data,
        })),
      }}
    />
  );
}
