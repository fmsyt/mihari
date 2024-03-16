import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

import { Grid, Skeleton, Typography } from "@mui/material";
import { getAppConfig, startWatchResource } from "../api";
import Panel from "./Panel";
import { AppConfig, ChartContextResource, ChartProviderProps, ResourceUpdatedPayloadRow } from "../types";
import Chart from "./Chart";
import ChartProvider from "./ChartProvider";
import ChartValue from "./ChartValue";

interface DeltasSummary {
  [id: string]: ChartProviderProps["incomingDeltas"];
}

const MonitorContainer = () => {

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [chartList, setChartList] = useState<ChartProviderProps[]>([]);

  useEffect(() => {

    let alive = false;
    let unlisten: UnlistenFn | undefined = undefined;
    let stopWatchResource: (() => void) | undefined = undefined;

    const fn = async () => {

      if (alive) return;
      alive = true;

      const config = await getAppConfig();
      setConfig(config);

      console.log("Start monitoring");
      stopWatchResource = startWatchResource();

      unlisten = await listen<AppConfig>("configChanged", ({ payload: config }) => {
        setConfig(config);
      });
    }

    fn();

    return () => {
      alive = false;
      unlisten && unlisten();
      stopWatchResource && stopWatchResource();
    }

  }, [])



  useEffect(() => {

    if (!config?.monitor) {
      return;
    }

    const { monitor } = config;

    let alive = false;
    let unlisten: UnlistenFn | undefined = undefined;
    const fn = async () => {

      if (alive) return;
      alive = true;

      await new Promise(resolve => setTimeout(resolve, 100));

      const chartList: ChartProviderProps[] = [];
      if (monitor?.cpu?.show) {

        const cpuResources = [] as ChartContextResource[];

        chartList.push({
          id: "cpu",
          label: monitor.cpu.label,
          lines: cpuResources,
          incomingDeltas: []
        });
      }

      if (monitor?.memory?.show) {

        const memoryResources = [] as ChartContextResource[];

        chartList.push({
          id: "memory",
          label: monitor.memory.label,
          lines: memoryResources,
          incomingDeltas: []
        });
      }

      setChartList(chartList);

      console.log("Register resourceUpdated event listener");
      unlisten = await listen<ResourceUpdatedPayloadRow[]>("resourceUpdated", ({ payload }) => {

        setChartList((prev) => {
          // console.debug("resourceUpdated", payload);

          const deltasSummary = payload.reduce((prev, row) => {
            prev[row.chart_id] = row.delta;
            return prev;
          }, {} as DeltasSummary);

          const next = prev.map((chart) => {
            return {
              ...chart,
              incomingDeltas: deltasSummary[chart.id] || []
            }
          })

          return next;
        });


      });
    }

    fn();

    return () => {
      alive = false;
      if (unlisten) {
        console.log("Unregister resourceUpdated event listener");
        unlisten();
      }
    }

  }, [config?.monitor])


  return (
    <Grid
      container
      gap="4px"
      height="100%"
      display="grid"
      gridTemplateColumns="max-content max-content 1fr"
      gridTemplateRows={`repeat(${chartList.length}, 1fr)`}
    >
      {chartList.length === 0 && (
        <Skeleton
          variant="rounded"
          animation="wave"
          height="100%"
        />
      )}

      {chartList.map((props) => (
        <ChartProvider
          key={props.id}
          {...props}
        >
          <Grid item>
            <Panel width="3em">
              <Typography variant="caption">{props.label}</Typography>
            </Panel>
          </Grid>
          <Grid item>
            <Panel width="3em">
              <ChartValue />
            </Panel>
          </Grid>
          <Grid item>
            <Panel padding="4px">
              <Chart />
            </Panel>
          </Grid>
        </ChartProvider>
      ))}
    </Grid>
  )
}

export default MonitorContainer;
