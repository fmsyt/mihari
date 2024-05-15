import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { getAppConfig } from "./api";
import { AppConfig } from "./types";

interface Props {
  children?: ReactNode;
}

export default function ContextMenuContainer(props: Props) {

  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {

    let unListen: UnlistenFn | undefined = undefined;

    (async () => {

      // FIXME: Replace this to check tauri API is ready
      await new Promise(resolve => setTimeout(resolve, 100));
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

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    }

    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    }

  }, [config?.window.alwaysOnTop])


  return (
    <Fragment>
      {props.children}
    </Fragment>
  )
}
