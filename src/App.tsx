import { Box, Typography } from "@mui/material";
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
            } as Resource<MemoryState>,
            // {
            //   label: "Swap",
            //   updateHandler: async () => {
            //     const [memory, swap] = await Promise.all([
            //       getMemoryState(),
            //       getSwapState(),
            //     ]);

            //     return {
            //       memory,
            //       swap,
            //     }
            //   },
            //   toValue: ({ memory, swap }) => {
            //     return (swap.total / memory.total) * 100;
            //   },
            // } as Resource<{ memory: MemoryState; swap: SwapState }>,
          ],
          monitorLabelComponent: ({ values }) => {
            if (values.length === 0) {
              return "";
            }

            return (
              <Typography variant="caption">
                {`${values[0].toFixed(0)}%`}
              </Typography>
            )
          },
        }
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
