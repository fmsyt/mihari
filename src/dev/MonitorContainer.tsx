import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";

import { getAppConfig, startWatchResource } from "../api";
import Monitor from "../components/Monitor";
import { AppConfig, ChartType, UpdateResourceEventPayload } from "../types";

const MonitorContainer = () => {

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [chartList, setChartList] = useState<ChartType[]>([]);

  useEffect(() => {

    let unlisten: UnlistenFn | undefined = undefined;

    const fn = async () => {

      const config = await getAppConfig();
      setConfig(config);

      await startWatchResource();

      unlisten = await listen<AppConfig>("configChanged", ({ payload: config }) => {
        setConfig(config);
      });
    }

    fn();

    return () => {
      unlisten && unlisten();
    }

  }, [])


  const handleResourceUpdated = useCallback(({ payload }: { payload: UpdateResourceEventPayload }) => {
    console.log("handleResourceUpdated", payload);
  }, []);



  useEffect(() => {

    if (!config?.monitor) {
      return;
    }

    let unlisten: UnlistenFn | undefined = undefined;
    const fn = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      await startWatchResource();
      unlisten = await listen<UpdateResourceEventPayload>("resourceUpdated", handleResourceUpdated);
    }

    fn();

    return () => {
      unlisten && unlisten();
    }

  }, [config?.monitor?.cpu?.show, handleResourceUpdated])


  return (
    <div>
      ほげ
    </div>
  )
}

export default MonitorContainer;
