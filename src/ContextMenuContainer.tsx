import { Fragment, ReactNode, useEffect } from "react";

import { UnlistenFn, emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { WebviewWindow } from "@tauri-apps/api/window";

import handleSaveOnConfigChanged from "./handleSaveOnConfigChanged";
import i18n from "./i18n";
import useAppConfig from "./useAppConfig";

const { t } = i18n;

interface Props {
  children?: ReactNode;
}

export default function ContextMenuContainer(props: Props) {

  const config = useAppConfig();

  useEffect(() => {

    handleSaveOnConfigChanged();

    let unListen: UnlistenFn | undefined = undefined;

    (async () => {
      const unListenQuit = await listen("quit", () => invoke("quit"));

      unListen = () => {
        unListenQuit();
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

      const unlistenTheme = await listen("theme", async ({ payload }) => {

        const theme = payload as "light" | "dark" | null;
        config.window.theme = theme;

        await Promise.all([
          emit("configChanged", config),
        ])
      });

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
        unlistenTheme && unlistenTheme();
      }

    }

    open();


    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      invoke("plugin:context_menu|show_context_menu", {
        pos: { x: e.clientX, y: e.clientY },
        items: [
          {
            label: t("themeMode"),
            disabled: !config,
            subitems: [
              {
                label: t("themeModeSystem"),
                checked: !config?.window.theme,
                event: "theme",
                payload: null,
              },
              {
                label: t("themeModeLight"),
                checked: config?.window.theme === "light",
                event: "theme",
                payload: "light",
              },
              {
                label: t("themeModeDark"),
                checked: config?.window.theme === "dark",
                event: "theme",
                payload: "dark",
              },
            ],
          },
          {
            label: t("alwaysOnTop"),
            checked: Boolean(config?.window.alwaysOnTop),
            event: "always_on_top",
            payload: JSON.stringify(!config?.window.alwaysOnTop),
            disabled: !config,
          },
          {
            label: t("decoration"),
            checked: Boolean(config?.window.decoration),
            event: "decoration",
            payload: JSON.stringify(!config?.window.decoration),
            disabled: !config,
          },
          {
            is_separator: true,
          },
          {
            label: t("quit"),
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
