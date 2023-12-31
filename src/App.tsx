import { useState } from "react";
import "./App.css";

import { getCpuState, getMemoryState, getSwapState } from "./api";
import { Chart, ChartProps } from "./components/Chart";

type AppChartProps = ChartProps<number>;

const defaultStack: AppChartProps[] = [
  {
    label: 'CPU',
    handlers: [
      async () => {
        const cpu = await getCpuState();
        console.log(cpu);
        return cpu.system * 100 + cpu.user * 100;
      }
    ],
    series: [{
      label: 'CPU',
      handleUpdate: async () => {
        const cpu = await getCpuState();
        console.log(cpu);
        return cpu.system * 100 + cpu.user * 100;
      }
    }],
  },
  {
    label: 'Memory',
    handlers: [
      async () => {
        const memory = await getMemoryState();
        // console.log(memory);
        return (1 - memory.free / memory.total) * 100;
      }
    ],
    series: [{
      label: 'Memory',
      handleUpdate: async () => {
        const memory = await getMemoryState();
        // console.log(memory);
        return (1 - memory.free / memory.total) * 100;
      }
    }],
  },
  {
    label: 'Swap',
    handlers: [
      async () => {
        const swap = await getSwapState();
        // console.log(swap);
        return (swap.free / swap.total) * 100;
      }
    ],
    series: [{
      label: 'Swap',
      handleUpdate: async () => {
        const swap = await getSwapState();
        // console.log(swap);
        return (swap.free / swap.total) * 100;
      }
    }],
  }
];

function App() {

  const [stack, _setStack] = useState<AppChartProps[]>(defaultStack);

  return (

    <>
      {stack.map((data) => (
        <Chart
          key={data.label}
          {...data}
          />
      ))}
    </>

  );
}

export default App;
