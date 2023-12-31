import { Grid } from "@mui/material";
import { Fragment } from "react";

import { ResourceGroup } from "../types";
import Chart from "./GoogleChartsChart";
import Panel from "./Panel";
import ResourceLabel from "./ResourceLabel";
import ResourceProvider from "./ResourceProvider";
import ResourceValue from "./ResourceValue";

export default function Monitor(props: {
  resources: ResourceGroup[];
  muiGridProps?: typeof Grid;
}) {
  const { resources, muiGridProps } = props;

  return (
    <ResourceProvider groups={resources}>
      <Grid
        container
        gap="4px"
        height="100%"
        display="grid"
        gridTemplateColumns="max-content max-content 1fr"
        gridTemplateRows={`repeat(${resources.length}, 1fr)`}
        {...muiGridProps}
      >
        {resources.map((group) => (
          <Fragment key={group.id}>
            <Grid item>
              <Panel width="3em">
                <ResourceLabel id={group.id} />
              </Panel>
            </Grid>
            <Grid item>
              <Panel width="3em">
                <ResourceValue id={group.id} />
              </Panel>
            </Grid>
            <Grid item>
              <Panel padding="4px">
                <Chart id={group.id} />
              </Panel>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </ResourceProvider>
  );
}
