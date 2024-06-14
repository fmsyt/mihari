import { ChartsYAxisProps, LineSeriesType } from '@mui/x-charts';
import { LineChart } from '@mui/x-charts/LineChart';
import { useContext } from 'react';
import ChartContext from './ChartContext';
import ChartProps from './ChartProps';

type MuiChartProps = ChartProps;

/**
 * @see https://mui.com/x/react-charts/lines/
 */
export default function MuiChart(_: MuiChartProps) {
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
      // disableLineItemHighlight
      grid={{ vertical: true, horizontal: false }}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      slotProps={{
        legend: {
          hidden: true,
        },
        popper: {
          hidden: true,
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

