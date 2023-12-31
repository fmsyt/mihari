import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const defaultHistoryLength = 10;

type TData = number;
type TLabel = string;

interface Props<T extends TData> {
  length?: number;
  label?: string;
  handlers: (() => T | Promise<T>)[];
}

export default function ChartJsChart<T extends TData>(props: Props<T>) {

  const {
    label,
    length,
    handlers,
  } = props;

  const ref = useRef<ChartJS<"line", T[], TLabel>>(null)

  const [historyLength, setHistoryLength] = useState(defaultHistoryLength);
  useLayoutEffect(() => {
    setHistoryLength(length || defaultHistoryLength);
  }, [length]);

  const xLabels = useMemo(() => {
    let digits = 0;
    let n = historyLength;
    while (n > 0) {
      n = Math.floor(n / 10);
      digits++;
    }

    return Array(historyLength).fill(0).map((_, i) => {
      const n = i + 1;
      const s = n.toString();
      return s.padStart(digits, '0');
    });

  }, [historyLength]);

  useLayoutEffect(() => {
    const interval = setInterval(async () => {
      const chart = ref.current;
      if (!chart) {
        return;
      }

      const next = await Promise.all(handlers.map(h => h()));
      next.forEach((v, i) => {
        chart.data.datasets[i].data?.push(v);

        if (chart.data.datasets[i].data?.length > historyLength) {
          chart.data.datasets[i].data?.shift();

          let lastLabel = chart.data.labels?.[chart.data.labels?.length - 1] || 0;
          chart.data.labels?.push(((+lastLabel + 1) % historyLength).toString());
          chart.data.labels?.shift();
        }
      });

      chart.update();

    }, 1000);

    return () => {
      clearInterval(interval);
    }
  }, [handlers, historyLength]);




  return (
    <Line
      ref={ref}
      options={{
        responsive: true,
        plugins: {
          tooltip: {
            // enabled: false,
          },
          // legend: {
          //   position: 'top' as const,
          // },
          // title: {
          //   display: true,
          //   text: 'Chart.js Line Chart',
          // },
        },
        scales: {
          x: {
            ticks: {
              // maxTicksLimit: historyLength - 1,
              minRotation: 0,
              maxRotation: 0,
            }
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              display: false,
            }
          },
        },
        animation: false,
        elements: {
          point: {
          }
        },
        datasets: {
          line: {
            // pointRadius: 0,
            // pointHoverRadius: 0,
            fill: "stack"
          }
        },
      }}
      data={{
        labels: xLabels,
        datasets: [{
          label,
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      }}
      />
  )
}
