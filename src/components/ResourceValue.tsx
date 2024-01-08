import { ReactNode, useContext, useMemo } from "react";
import { Typography } from "@mui/material";

import ResourceContext from "./ResourceContext";

interface ResourceValueProps {
  id: string;
  displayComponent?: (param: {
    values: number[];
    rawValues: any[];
  }) => ReactNode;
}

export default function ResourceValue(props: ResourceValueProps) {
  const { id, displayComponent } = props;
  const { getGroup, getCurrentValues, getCurrentRawValues } = useContext(ResourceContext);

  const group = useMemo(() => getGroup(id), [getGroup, id]);

  const { values, rawValues } = useMemo(() => {
    const values = getCurrentValues(id);
    const rawValues = getCurrentRawValues(id);

    return { values, rawValues };
  }, [getCurrentValues, id]);

  if (displayComponent) {
    return displayComponent({ values, rawValues });
  }

  if (group?.monitorLabelComponent) {
    return group.monitorLabelComponent({ values, rawValues });
  }

  return (
    <Typography variant="caption">
      {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}%
    </Typography>
  );
}
