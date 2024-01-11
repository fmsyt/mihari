import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getAppConfig, getCpuCoreState, getCpuState, getCpuStateAggregate, getMemoryState } from "./api";
import { AppConfig, CPUState, MemoryState, Resource, ResourceGroup } from "./types";

export default function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [resources, setResources] = useState<ResourceGroup[]>([]);

  useEffect(() => {
    (async () => {
      const config = await getAppConfig();

      const nextResources = [] as ResourceGroup[];
      const cpuState = await getCpuState();

      if (config.monitor.showCpuAggregateState) {
        nextResources.push({
          id: "cpu_aggregate",
          label: "CPU",
          resources: [
            {
              label: "CPU",
              updateHandler: getCpuStateAggregate,
              toValue: (cpu) => {
                return cpu.system * 100 + cpu.user * 100;
              },
            } as Resource<CPUState>,
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
        });
      }

      if (config.monitor.showCpuState) {
        nextResources.push({
          id: "cpu",
          label: "CPU",
          resources: cpuState.map((_, i) => ({
            label: `Core ${i + 1}`,
            updateHandler: () => getCpuCoreState(i),
            toValue: (core) => {
              return core.system * 100 + core.user * 100;
            },
          })) as Resource<CPUState>[],
        });
      }

      if (config.monitor.showMemoryState) {
        nextResources.push({
          "id": "memory",
          label: "Mem",
          resources: [
            {
              label: "Mem",
              updateHandler: getMemoryState,
              toValue: (memory) => {
                return (1 - memory.free / memory.total) * 100;
              },
            } as Resource<MemoryState>,
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
        });
      }

      setResources(nextResources);
      setConfig(config);
    })();
  }, [])

  return {
    config,
    resources,
  };
}
