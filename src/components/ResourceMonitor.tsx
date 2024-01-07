import { Grid } from "@mui/material";

import ResourceProvider from "./ResourceProvider";
import { ResourceGroup } from "../types";
import ChartExperimental from "./ChartExperimental";

interface Props {
  resources: ResourceGroup[];
  muiGridProps?: typeof Grid;
}

export default function ResourceMonitor(props: Props) {
  const { resources, muiGridProps } = props;

  return (
    <ResourceProvider groups={resources}>
      <Grid
        container
        spacing={2}
        sx={{
          width: "100%",
          height: "100%",
        }}
        display="grid"
        gridTemplateRows={`repeat(${resources.length}, 1fr)`}
        {...muiGridProps}
      >
        {resources.map((group) => (
          <Grid key={group.id} item>
            <ChartExperimental {...group} />
          </Grid>
        ))}
      </Grid>
    </ResourceProvider>
  );
}
