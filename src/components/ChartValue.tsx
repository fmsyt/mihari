import { Typography } from "@mui/material";
import { useContext, useMemo } from "react";
import ChartContext from "./ChartContext";

const ChartValue = () => {

  const { currentLineValues: current } = useContext(ChartContext);
  const display = useMemo(() => {
    const value = Math.round(current.reduce((a, b) => a + b, 0) / current.length)
    if (isNaN(value)) {
      return "";
    }

    return `${value}%`;

  }, [current])

  return (
    <Typography variant="caption">
      {display}
    </Typography>
  )
}

export default ChartValue
