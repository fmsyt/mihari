import { Grid } from "@mui/material";
import { useState } from "react";

import "./App.css";

import { getCpuState, getMemoryState, getSwapState } from "./api";
import { Chart, ChartProps } from "./components/Chart";
import { ResourceGroup } from "./types";
import ResourceProvider from "./components/ResourceProvider";

type AppChartProps = ChartProps<number>;

const cpuUpdateHandler = async () => {
  const cpu = await getCpuState();
  return cpu.system * 100 + cpu.user * 100;
};

const memoryUpdateHandler = async () => {
  const memory = await getMemoryState();
  return (1 - memory.free / memory.total) * 100;
};

const swapUpdateHandler = async () => {
  const swap = await getSwapState();
  return (swap.free / swap.total) * 100;
};

const defaultResourceGroups: ResourceGroup[] = [
  {
    id: "cpu",
    label: "CPU",
    resources: [
      {
        label: "CPU",
        updateHandler: cpuUpdateHandler,
      },
    ],
  },
];

const defaultStack: AppChartProps[] = [
  {
    label: "CPU",
    handlers: [cpuUpdateHandler],
    series: [
      {
        label: "CPU",
        handleUpdate: cpuUpdateHandler,
      },
    ],
  },
  {
    label: "Memory",
    handlers: [memoryUpdateHandler],
    series: [
      {
        label: "Memory",
        handleUpdate: memoryUpdateHandler,
      },
    ],
  },
  {
    label: "Swap",
    handlers: [swapUpdateHandler],
    series: [
      {
        label: "Swap",
        handleUpdate: swapUpdateHandler,
      },
    ],
  },
];

function App() {
  const [stack, _setStack] = useState<AppChartProps[]>(defaultStack);

  return (
    <ResourceProvider groups={defaultResourceGroups}>
      <Grid
        container
        spacing={2}
        sx={{
          height: "100vh",
          width: "100vw",
        }}
      >
        {stack.map((data) => (
          <Grid item xs={4}>
            <Chart key={data.label} {...data} />
          </Grid>
        ))}
      </Grid>
    </ResourceProvider>
  );
}

export default App;
