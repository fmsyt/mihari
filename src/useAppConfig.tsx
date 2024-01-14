import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";

import { getAppConfig, startWatchResource } from "./api";
import { AppConfig } from "./types";

export default function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {

    let unListen: UnlistenFn | undefined = undefined;

    (async () => {
      const config = await getAppConfig();
      setConfig(config);

      unListen = await listen<AppConfig>("configChanged", ({ payload: config }) => {
        setConfig(config);
      });

    })();

    return () => {
      unListen && unListen();
    }

  }, [])

  const watchingRef = useRef(false);

  useEffect(() => {

    if (watchingRef.current) {
      return;
    }

    if (!config?.monitor?.cpu?.show) {
      return;
    }

    watchingRef.current = true;
    startWatchResource();

  }, [config?.monitor?.cpu?.show])

  return config;
}
