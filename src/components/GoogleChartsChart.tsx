import { Box } from "@mui/material";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { Chart } from "react-google-charts";
import ChartProps from "./ChartProps";

type ChartExperimentalProps = ChartProps;

/**
 * @see https://developers.google.com/chart/interactive/docs?hl=ja
 * @see https://www.react-google-charts.com/examples/area-chart
 * @see https://qiita.com/arakaki_tokyo/items/9f57524df1509837bbec#google-charts
 */
export default function ChartExperimental(props: ChartExperimentalProps) {
  const { headerRow, rows } = props;

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
              ticks: [25, 50, 75],
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
