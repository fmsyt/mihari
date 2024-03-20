import bytes, { Unit } from "bytes";
import { CPUState, MemoryState, SwapState } from "./types";

export function cpuTooltip(state: CPUState): string {
  return `System: ${state.system}%\nUser: ${state.user}%\nNice: ${state.nice}%\nIdle: ${state.idle}%\nInterrupt: ${state.interrupt}%`;
}

let unit: Unit | null = null;

function getUnit(value: number): Unit {
  const c = Math.log2(value) / 10;
  return c < 1 ? "B" : c < 2 ? "KB" : c < 3 ? "MB" : c < 4 ? "GB" : c < 5 ? "TB" : "PB";
}

export function memoryTooltip(state: MemoryState): string {

  if (!unit) {
    unit = getUnit(state.total);
  }

  const total = bytes(state.total, { unit });
  const used = bytes(state.used, { unit });

  return `Total: ${total}\nUsed: ${used}`;
}

export function swapTooltip(state: SwapState): string {

  const unit = getUnit(state.total);
  const total = bytes(state.total, { unit });
  const used = bytes(state.used, { unit });

  return `Total: ${total}\nUsed: ${used}`;
}
