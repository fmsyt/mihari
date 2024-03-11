import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";

import { getAppConfig, startWatchResource } from "../api";
import Monitor from "../components/Monitor";
import { AppConfig, ResourceGroup, UpdateResourceEventData } from "../types";

const MonitorProvider = () => {

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [resources, setResources] = useState<ResourceGroup[]>([]);

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


  const handleResourceUpdated = useCallback(({ payload }: { payload: UpdateResourceEventData }) => {

    setResources((prev) => {
      const next = [...prev];

      Object.entries(payload).forEach(([key, value]) => {
        const resource = next.find((r) => r.id === key);
        if (!resource) {
          return;
        }

        // TODO: Update resource
      });

      return next;
    });

  }, []);



  useEffect(() => {

    if (!config?.monitor) {
      return;
    }

    let unlisten: UnlistenFn | undefined = undefined;
    const fn = async () => {
      await startWatchResource();
      unlisten = await listen<UpdateResourceEventData>("resourceUpdated", handleResourceUpdated);
    }

    fn();

    return () => {
      unlisten && unlisten();
    }

  }, [config?.monitor?.cpu?.show, handleResourceUpdated])


  return (
    <Monitor resources={resources} />
  )
}

export default MonitorProvider;
