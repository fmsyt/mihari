import { createContext } from "react";
import { UpdateResourceEventData } from "../types";

const MonitorContext = createContext<UpdateResourceEventData>({
  cpu: null,
  cpuAggregated: null,
  memory: null,
  swap: null,
});

export default MonitorContext;
