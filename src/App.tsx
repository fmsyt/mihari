import { Box } from "@mui/material";
import { useLayoutEffect, useState } from "react";

import ThemeProvider from "./ThemeProvider";
import {
  getCpuCoreState,
  getCpuState,
  getMemoryState,
  getSwapState,
} from "./api";
import Monitor from "./components/Monitor";
import {
  CPUState,
  MemoryState,
  Resource,
  ResourceGroup,
  SwapState,
} from "./types";

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
          label: "Mem",
          resources: [
            {
              label: "Mem",
              updateHandler: getMemoryState,
              toValue: (memory) => {
                return (1 - memory.free / memory.total) * 100;
              },
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
              },
            },
          ] as Resource<SwapState>[],
        },
      ];

      setResources(next);
    };

    func();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <ThemeProvider>
      <Box sx={{ width: "100%", height: "100vh" }}>
        <Monitor resources={resources} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
