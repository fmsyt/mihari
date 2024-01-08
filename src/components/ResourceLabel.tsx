import { useContext, useMemo } from "react";
import { Typography } from "@mui/material";

import ResourceContext from "./ResourceContext";

export default function ResourceLabel(props: { id: string }) {
  const { id } = props;
  const { resourceGroups } = useContext(ResourceContext);

  const resourceGroup = useMemo(() => {
    const group = resourceGroups?.find((g) => g.id === id);
    if (!group) {
      return {
        id,
        label: id,
        resources: [],
      };
    }

    return group;
  }, [resourceGroups, id]);

  return <Typography variant="caption">{resourceGroup.label}</Typography>;
}
