import { Box } from "@mui/material";

import { useLayoutEffect, useState } from "react";
import { getCpuCoreState, getCpuState, getCpuStateAggregate, getMemoryState, getSwapState } from "./api";
import { CPUState, MemoryState, SwapState } from "./types";
import ResourceMonitor from "./components/ResourceMonitor";
import { Resource, ResourceGroup } from "./types";

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
            updateHandler: () => getCpuCoreState(i),
            toValue: (core) => {
              return core.system * 100 + core.user * 100;
            },
          })) as Resource<CPUState>[],
        },
        {
          id: "memory",
          label: "Memory",
          resources: [
            {
              label: "Memory",
              updateHandler: getMemoryState,
              toValue: (memory) => {
                return (1 - memory.free / memory.total) * 100;
              }
            },
          ] as Resource<MemoryState>[],
        },
        {
          id: "swap",
          label: "Swap",
          resources: [
            {
              label: "Swap",
              updateHandler: getSwapState,
              toValue: (swap) => {
                return (swap.free / swap.total) * 100;
              }
            },
          ] as Resource<SwapState>[],
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
