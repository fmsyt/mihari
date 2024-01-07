import { useContext, useMemo } from "react";
import { Typography } from "@mui/material";

import ResourceContext from "./ResourceContext";

interface ResourceValueProps {
  id: string;
  toDisplay?: (value: number) => string;
}

export default function ResourceValue(props: ResourceValueProps) {
  const { id } = props;
  const { getCurrentValues } = useContext(ResourceContext);

  const values = useMemo(() => {
    return getCurrentValues(id);
  }, [getCurrentValues, id]);

  return (
    <Typography variant="caption">
      {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}%
    </Typography>
  );
}
