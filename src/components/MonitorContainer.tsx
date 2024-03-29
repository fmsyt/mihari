import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { useContext, useEffect, useState } from "react";

import { Grid, Skeleton, Typography } from "@mui/material";
import { getAppConfig, startWatchResource } from "../api";
import { AppConfig, ChartProviderProps, MonitorKey, UpdateResourceEventPayload } from "../types";
import Chart from "./Chart";
import ChartProvider from "./ChartProvider";
import ChartValue from "./ChartValue";
import Panel from "./Panel";
import ThemeContext from "../ThemeContext";

const MonitorContainer = () => {

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [chartList, setChartList] = useState<ChartProviderProps[]>([]);

  const { setThemeMode } = useContext(ThemeContext);

  useEffect(() => {

    let alive = false;
    let unlisten: UnlistenFn | undefined = undefined;
    let stopWatchResource: (() => void) | undefined = undefined;

    const fn = async () => {

      if (alive) return;
      alive = true;

      const config = await getAppConfig();
      setConfig(config);

      console.log("Config loaded", config);

      console.log("Start monitoring");
      stopWatchResource = await startWatchResource();

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
    if (!config?.window.theme) {
      return;
    }

    setThemeMode(config.window.theme);
  }, [config?.window.theme, setThemeMode]);


  useEffect(() => {

    if (!config?.monitor.resource) {
      return;
    }

    const { monitor } = config;
    const { resource } = monitor;

    let unlisten: UnlistenFn | undefined = undefined;
    const fn = async () => {

      const chartList: ChartProviderProps[] = Object.keys(resource).reduce((prev, key) => {
        const item = resource[key as MonitorKey];
        if (!item.show) {
          return prev;
        }

        prev.push({
          id: key as MonitorKey,
          label: item.label,
          lines: [],
          incomingDeltas: []
        });

        return prev;
      }, [] as ChartProviderProps[]);

      setChartList(chartList);

      console.log("Register resourceUpdated event listener");
      unlisten = await listen<UpdateResourceEventPayload>("resourceUpdated", ({ payload }) => {

        setChartList((prev) => {
          // console.debug("resourceUpdated", payload);

          const next = prev.map((chart) => {

            const chartId = chart.id;
            const row = payload[chartId];

            return {
              ...chart,
              incomingDeltas: row?.delta || [],
            }
          });

          return next;
        });


      });
    }

    fn();

    return () => {
      if (unlisten) {
        console.log("Unregister resourceUpdated event listener");
        unlisten();
      }
    }

  }, [
    config?.monitor.resource.cpu.show,
    config?.monitor.resource.memory.show,
    config?.monitor.resource.swap.show
  ])


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
