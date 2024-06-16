import { Tooltip, Typography } from "@mui/material";
import { useContext } from "react";
import { cpuTooltip, memoryTooltip, swapTooltip } from "../resource";
import { CPUState, MemoryState, SwapState } from "../types";
import ChartContext from "./ChartContext";

const ChartValue = () => {

  const { id, currentLineValues: current, currentLineRaws } = useContext(ChartContext);
  const display = (() => {
    const value = Math.round(current.reduce((a, b) => a + b, 0) / current.length)
    if (isNaN(value)) {
      return "";
    }

    return `${value}%`;

  })();

  const title = (() => {

    if (currentLineRaws.length === 0) {
      return null;
    }

    switch (id) {
      case "cpu":

        const initialCpuState: CPUState = {
          system: 0,
          user: 0,
          nice: 0,
          idle: 0,
          interrupt: 0,
        }

        const summary: CPUState = (currentLineRaws as CPUState[]).reduce((prev, current) => {
          return {
            system: prev.system + (current as CPUState).system,
            user: prev.user + (current as CPUState).user,
            nice: prev.nice + (current as CPUState).nice,
            idle: prev.idle + (current as CPUState).idle,
            interrupt: prev.interrupt + (current as CPUState).interrupt,
          }
        }, initialCpuState);

        const average: CPUState = {
          system: Math.round(10000 * summary.system / currentLineRaws.length) / 100,
          user: Math.round(10000 * summary.user / currentLineRaws.length) / 100,
          nice: Math.round(10000 * summary.nice / currentLineRaws.length) / 100,
          idle: Math.round(10000 * summary.idle / currentLineRaws.length) / 100,
          interrupt: Math.round(10000 * summary.interrupt / currentLineRaws.length) / 100,
        }

        return cpuTooltip(average);
      case "memory":
        return memoryTooltip(currentLineRaws[0] as MemoryState);
      case "swap":
        return swapTooltip(currentLineRaws[0] as SwapState);
      default:
        return null;
    }

  })();


  return (
    <Tooltip
      title={title}
      arrow
      placement="right"
      slotProps={{
        tooltip: {
          sx: {
            whiteSpace: "pre"
          }
        }
      }}
    >
      <Typography variant="caption">
        {display}
      </Typography>
    </Tooltip>
  )
}

export default ChartValue
