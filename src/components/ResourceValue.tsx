import { ReactNode, useContext, useMemo } from "react";
import { Box, Typography } from "@mui/material";

import ResourceContext from "./ResourceContext";

interface ResourceValueProps {
  id: string;
  displayComponent?: (param: { values: number[], rawValues: any[] }) => ReactNode;
}

export default function ResourceValue(props: ResourceValueProps) {
  const { id, displayComponent } = props;
  const { getCurrentValues, getCurrentRawValues } = useContext(ResourceContext);

  const { values, rawValues } = useMemo(() => {
    const values = getCurrentValues(id);
    const rawValues = getCurrentRawValues(id);

    return { values, rawValues };
  }, [getCurrentValues, id]);

  return (
    <Box>
      {!displayComponent ? (
        <Typography variant="caption">
          {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}%
        </Typography>
      ) : (
        displayComponent({ values, rawValues })
      )}
    </Box>
  );
}
