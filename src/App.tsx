import { useState } from "react";
import "./App.css";

import { getCpuState, getMemoryState, getSwapState } from "./api";
import HighchartsChart from "./components/Chart";

interface ChartProps {
  id: string;
  label?: string;
  handler: () => number | Promise<number>;
}

const defaultStack: ChartProps[] = [
  {
    id: 'cpu',
    label: 'CPU',
    handler: async () => {
      const cpu = await getCpuState();
      console.log(cpu);
      return cpu.system * 100 + cpu.user * 100;
    }
  },
  {
    id: "memory",
    label: 'Memory',
    handler: async () => {
      const memory = await getMemoryState();
      // console.log(memory);
      return (1 - memory.free / memory.total) * 100;
    }
  },
  {
    id: "swap",
    label: 'Swap',
    handler: async () => {
      const swap = await getSwapState();
      // console.log(swap);
      return (swap.free / swap.total) * 100;
    }
  }
];

function App() {

  const [stack, _setStack] = useState<ChartProps[]>(defaultStack);

  return (

    <>
      {stack.map((data) => (
        <HighchartsChart
          key={data.id}
          label={data.label}
          handlers={[data.handler]}
          />
      ))}
    </>

  );
}

export default App;
