import { Typography } from "@mui/material";
import { getCpuCoreState, getCpuState, getCpuStateAggregate, getMemoryState } from "./api";
import { AppConfig, CPUState, MemoryState, Resource, ResourceGroup } from "./types";

export default async function createResourceList(config: AppConfig) {
  const cpuState = await getCpuState();
  const { cpu, memory } = config.monitor;

  const nextResources = [] as ResourceGroup[];

  if (cpu.show && cpu.showAggregated) {
    nextResources.push({
      id: "cpu_aggregate",
      label: cpu.label,
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
        );
      },
    });
  }

  if (cpu.show && !cpu.showAggregated) {
    nextResources.push({
      id: "cpu",
      label: cpu.label,
      resources: cpuState.map((_, i) => ({
        label: `Core ${i + 1}`,
        updateHandler: () => getCpuCoreState(i),
        toValue: (core) => {
          return core.system * 100 + core.user * 100;
        },
      })) as Resource<CPUState>[],
    });
  }

  if (memory.show) {
    nextResources.push({
      "id": "memory",
      label: memory.label,
      resources: [
        {
          label: "Memory",
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
        );
      },
    });
  }

  return nextResources;
}
