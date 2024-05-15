import { Fragment, ReactNode, useEffect, useState } from "react";

import { UnlistenFn, emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { WebviewWindow } from "@tauri-apps/api/window";

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

      const unListenConfigChanged = await listen<AppConfig>("configChanged", ({ payload: config }) => {
        setConfig(config);
      });

      const unListenQuit = await listen("quit", () => {
        invoke("quit");
      });

      unListen = () => {
        unListenConfigChanged && unListenConfigChanged();
        unListenQuit && unListenQuit();
      }

    })();

    return () => {
      unListen && unListen();
    }

  }, [])


  useEffect(() => {

    const mainWindow = WebviewWindow.getByLabel("main");
    let unListen: UnlistenFn | null = null;

    const open = async () => {
      if (!config) {
        return null;
      }

      const unlistenAlwaysOnTop = await listen("always_on_top", async ({ payload }) => {
        config.window.alwaysOnTop = JSON.parse(payload as string);
        await emit("configChanged", config);

        if (!mainWindow) {
          return;
        }

        await mainWindow.setAlwaysOnTop(config.window.alwaysOnTop);
      });

      const unlistenDecoration = await listen("decoration", async ({ payload }) => {
        config.window.decoration = JSON.parse(payload as string);
        await emit("configChanged", config);

        if (!mainWindow) {
          return;
        }

        await mainWindow.setDecorations(config.window.decoration);
      });

      unListen = () => {
        unlistenAlwaysOnTop && unlistenAlwaysOnTop();
        unlistenDecoration && unlistenDecoration();
      }

    }

    open();


    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      invoke("plugin:context_menu|show_context_menu", {
        pos: { x: e.clientX, y: e.clientY },
        items: [
          {
            label: "表示",
            disabled: !config,
            subitems: [
              {
                label: "システム",
                checked: !config?.window.theme,
              },
              {
                label: "ライト",
                checked: config?.window.theme === "light",
              },
              {
                label: "ダーク",
                checked: config?.window.theme === "dark",
              },
            ],
          },
          {
            label: "常に手前に表示",
            checked: Boolean(config?.window.alwaysOnTop),
            event: "always_on_top",
            payload: JSON.stringify(!config?.window.alwaysOnTop),
            disabled: !config,
          },
          {
            label: "タイトルバーを表示",
            checked: Boolean(config?.window.decoration),
            event: "decoration",
            payload: JSON.stringify(!config?.window.decoration),
            disabled: !config,
          },
          {
            is_separator: true,
          },
          {
            label: "終了",
            event: "quit",
          }
        ],
      });
    }

    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      unListen && unListen();
    }

  }, [config?.window.alwaysOnTop, config?.window.decoration, config?.window.theme])


  return (
    <Fragment>
      {props.children}
    </Fragment>
  )
}
