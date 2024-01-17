import { Typography } from "@mui/material";
import { getCpuCoreState, getCpuState, getCpuStateAggregate, getMemoryState } from "./api";
import { CPUState, MemoryState, MonitorConfig, Resource, ResourceGroup } from "./types";

export default async function createResourceList(config: MonitorConfig) {
  const cpuState = await getCpuState();
  const { cpu, memory } = config;

  const nextResources = [] as ResourceGroup[];

  const toCpuValue = config.cpu.excludeIdle
    ? (cpu: CPUState) => cpu.system * 100 + cpu.user * 100
    : (cpu: CPUState) => 100 - cpu.idle * 100
    ;

  if (cpu.show && cpu.showAggregated) {
    nextResources.push({
      id: "cpu_aggregate",
      label: cpu.label,
      resources: [
        {
          label: "CPU",
          toValue: toCpuValue,
          updateHandler: getCpuStateAggregate,
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
        toValue: toCpuValue,
        updateHandler: () => getCpuCoreState(i),
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
