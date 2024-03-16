import { useContext, useMemo } from "react";
import ChartExperimental from "../components/GoogleChartsChart"
import ChartContext from "./ChartContext";

const Chart = () => {

  const { resources } = useContext(ChartContext);

  const { headerRow, rows } = useMemo(() => {

    const headerRow = resources.map((r) => r.label)

    const rows = Array(resources[0]?.values?.length).fill(0).map((_, i) => {
      return resources.map((r) => r.values[i])
    })

    const result = { headerRow, rows }
    return result;

  }, [resources])



  const canDraw = headerRow.length > 0 && rows.length > 0;
  return canDraw && (
    <ChartExperimental
      headerRow={headerRow}
      rows={rows}
    />
  )
}

export default Chart;
