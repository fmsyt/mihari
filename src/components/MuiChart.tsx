import { LineChart } from '@mui/x-charts/LineChart';
import ChartProps from './ChartProps';

type MuiChartProps = ChartProps;

/**
 * @see https://mui.com/x/react-charts/lines/
 */
export default function MuiChart (props: MuiChartProps) {
  const { headerRow, rows } = props;

  const series = rows.map((row, i) => {
    return {
      data: row,
      area: true,
    }
  
  })

  return (
    <LineChart 
      series={series}
    />
  );
}

