import { useContext } from "react";

import { AxisConfig, ChartsXAxisProps, ChartsYAxisProps, LineSeriesType } from "@mui/x-charts";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { LineChart, areaElementClasses } from "@mui/x-charts/LineChart";

import ChartContext from "./ChartContext";

const goldenRatioConjugate = 0.6180339887;

function hsla(i: number, total: number) {
  const hue = (((i / total + goldenRatioConjugate) % 1) * 360) | 0;
  return `hsla(${hue}, 70%, 50%, 0.8)`;
}

const Chart = () => {

  const { resources } = useContext(ChartContext);

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
      color: hsla(i, resources.length),
    });

    prev.xAxis.push({
      id,
      min: 1,
      max: r.values.length,
      data: Array(r.values.length).fill(0).map((_, i) => i + 1),
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
      // tooltip={{ trigger: 'none' }}
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
            stroke: theme.palette.grey[600],
          },
        },
        [`.${areaElementClasses.root}`]: {
          opacity: 0.2,
        },
      })}
    />
  );
}

export default Chart;
