import { createContext } from "react";
import { ChartContextValuesType } from "./types";

const ChartContext = createContext<ChartContextValuesType>({
  id: "",
  label: "",
  resources: [],
  currentLineValues: [],
})

export default ChartContext;
