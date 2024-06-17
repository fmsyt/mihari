import { useContext } from "react";

import { AxisConfig, ChartsXAxisProps, ChartsYAxisProps, LineSeriesType } from "@mui/x-charts";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { LineChart, areaElementClasses } from "@mui/x-charts/LineChart";

import ChartContext from "./ChartContext";
import ThemeContext from "../ThemeContext";

const goldenRatioConjugate = 0.6180339887;

function hsla(i: number, total: number) {
  const hue = (((i / total + goldenRatioConjugate) % 1) * 360) | 0;
  return `hsla(${hue}, 70%, 50%, 0.8)`;
}

export default function Chart() {

  const { isDarkMode } = useContext(ThemeContext);
  const { resources } = useContext(ChartContext);

  const colors = resources.map((_, i) => hsla(i, resources.length));
  const xValues = resources[0]?.values.map((_, i) => i + 1) as number[] | undefined;

  const { series, xAxis, yAxis } = resources.reduce((prev, r, i) => {

    const id = `${r.id}_${i}`;

    prev.series.push({
      id,
      data: r.values,
      type: 'line',
      area: true,
      showMark: false,
      curve: 'linear',
      label: r.label,
      color: colors[i],
    });

    prev.xAxis.push({
      id,
      min: 1,
      max: r.values.length,
      data: xValues,
      hideTooltip: true,
    });

    prev.yAxis.push({
      id,
      min: 0,
      max: 100,
    });

    return prev;

  }, {
    series: [] as LineSeriesType[],
    xAxis: [] as AxisConfig<"linear", number, ChartsXAxisProps>[],
    yAxis: [] as AxisConfig<"linear", number, ChartsYAxisProps>[],
  });

  return (
    <LineChart
      disableAxisListener
      disableLineItemHighlight
      grid={{ vertical: true, horizontal: true }}
      margin={{ top: 8, right: 8, bottom: 4, left: 4 }}
      series={series}
      skipAnimation
      tooltip={{ trigger: 'none' }}
      xAxis={xAxis}
      yAxis={yAxis}
      slotProps={{
        legend: {
          hidden: true,
        },
        axisTickLabel: {
          display: 'none',
        },
      }}
      sx={(theme) => ({
        [`.${axisClasses.root}`]: {
          [`.${axisClasses.line}, .${axisClasses.tick}`]: {
            stroke: theme.palette.grey[isDarkMode ? 600 : 500],
          },
        },
        [`.${areaElementClasses.root}`]: {
          opacity: 0.2,
        },
      })}
    />
  );
}
