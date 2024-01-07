import { Grid } from "@mui/material";

import { ResourceGroup } from "../types";
import ChartExperimental from "./ChartExperimental";
import ResourceProvider from "./ResourceProvider";
import { Fragment } from "react";
import ResourceLabel from "./ResourceLabel";
import ResourceValue from "./ResourceValue";
import Panel from "./Panel";

export default function Monitor(props: { resources: ResourceGroup[], muiGridProps?: typeof Grid }) {
  const { resources, muiGridProps } = props;

  return (
    <ResourceProvider groups={resources}>
      <Grid
        container
        spacing={1}
        height="100%"

        display="grid"
        gridTemplateColumns="max-content max-content 1fr"
        gridTemplateRows={`repeat(${resources.length}, 1fr)`}

        {...muiGridProps}
      >
        {resources.map((group) => (
          <Fragment key={group.id}>
            <Grid item>
              <Panel width="4em">
                <ResourceLabel id={group.id} />
              </Panel>
            </Grid>
            <Grid item>
              <Panel width="4em" justifyContent="end">
                <ResourceValue id={group.id} />
              </Panel>
            </Grid>
            <Grid item>
              <Panel>
                <ChartExperimental id={group.id} />
              </Panel>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </ResourceProvider>
  );
}