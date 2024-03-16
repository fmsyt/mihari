import { Grid } from "@mui/material";
import { Fragment, useContext } from "react";

import { Chart } from "./Chart";
import Panel from "./Panel";
import ResourceLabel from "./ResourceLabel";
import ResourceValue from "./ResourceValue";

import "../monitor.css"
import ResourceContext from "./ResourceContext";

export default function Monitor(props: {
  muiGridProps?: typeof Grid;
}) {

  const { resourceGroups: resources } = useContext(ResourceContext);
  const { muiGridProps } = props;

  return (
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
  );
}
