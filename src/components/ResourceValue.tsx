import { useContext, useMemo } from "react";
import { Typography } from "@mui/material";

import ResourceContext from "./ResourceContext";

export default function ResourceValue(props: { id: string; }) {
  const { id } = props;
  const { getCurrentValues } = useContext(ResourceContext);

  const values = useMemo(() => {
    return getCurrentValues(id);
  }, [getCurrentValues, id]);

  return (
    <Typography variant="body2">
      {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}
    </Typography>
  );
}
