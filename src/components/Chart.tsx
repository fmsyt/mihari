import { useContext } from "react";

import { ChartsYAxisProps, LineSeriesType } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts/LineChart";

import ChartContext from "./ChartContext";

const Chart = () => {

  const { resources } = useContext(ChartContext);

  const { series, yAxis } = resources.reduce((prev, r) => {

    prev.series.push({
      data: r.values,
      type: 'line',
      area: true,
      showMark: false,
      curve: 'linear',
      label: r.label,
    });

    prev.yAxis.push({
      max: 100,
      min: 0,
    } as ChartsYAxisProps);

    return prev;

  }, {
    series: [] as LineSeriesType[],
    yAxis: [] as ChartsYAxisProps[],
  });

  return (
    <LineChart
      series={series}
      yAxis={yAxis}
      skipAnimation
      disableAxisListener
      disableLineItemHighlight
      grid={{ vertical: false, horizontal: true }}
      margin={{ top: 8, right: 8, bottom: 4, left: 8 }}
      slotProps={{
        legend: {
          hidden: true,
        },
        popper: {
          // hidden: true,
        },
        axisTickLabel: {
          display: 'none',
        },
        axisTick: {
          // display: 'none',
        },
        axisLine: {
          // display: 'none',
        },
      }}
    />
  );
}

export default Chart;
