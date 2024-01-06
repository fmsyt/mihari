import { Box } from "@mui/material";

import "./App.css";

import { useLayoutEffect, useState } from "react";
import { getCpuCoreState, getCpuState, getCpuStateAggregate, getMemoryState, getSwapState } from "./api";
import ResourceMonitor from "./components/ResourceMonitor";
import { ResourceGroup } from "./types";

const _cpuUpdateHandler = async () => {
  const cpu = await getCpuStateAggregate();
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

function App() {
  const [resources, setResources] = useState<ResourceGroup[]>([]);

  useLayoutEffect(() => {

    let isActive = false;

    const func = async () => {

      if (isActive) {
        return;
      }

      isActive = true;

      const cores = await getCpuState();

      const next: ResourceGroup[] = [
        {
          id: "cpu",
          label: "CPU",
          resources: cores.map((_, i) => ({
            label: `Core ${i + 1}`,
            updateHandler: async () => {
              const core = await getCpuCoreState(i);
              return core.system * 100 + core.user * 100;
            },
          })),
        },
        {
          id: "memory",
          label: "Memory",
          resources: [
            {
              label: "Memory",
              updateHandler: memoryUpdateHandler,
            },
          ],
        },
        {
          id: "swap",
          label: "Swap",
          resources: [
            {
              label: "Swap",
              updateHandler: swapUpdateHandler,
            },
          ],
        },
      ];

      setResources(next);
    }

    func();

    return () => {
      isActive = false;
    };

  }, []);

  return (
    <Box sx={{ width: "100%", height: "100vh" }} padding={0}>
      <ResourceMonitor
        resources={resources}
      />
    </Box>
  );
}

export default App;
