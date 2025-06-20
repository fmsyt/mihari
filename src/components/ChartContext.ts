import { createContext } from "react"
import type { ChartContextValuesType, MonitorKey } from "../types"

const ChartContext = createContext<ChartContextValuesType>({
  id: "" as MonitorKey,
  label: "",
  resources: [],
  currentLineValues: [],
  currentLineRaws: [],
})

export default ChartContext
