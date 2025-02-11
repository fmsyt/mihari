import { invoke } from "@tauri-apps/api/core"
import { emit } from "@tauri-apps/api/event"
import { CheckMenuItem, Menu, MenuItem, Submenu } from "@tauri-apps/api/menu"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import { type MouseEventHandler, useCallback, useEffect } from "react"
import handleSaveOnConfigChanged from "./handleSaveOnConfigChanged"
import i18n from "./i18n"
import useAppConfig from "./useAppConfig"

const { t } = i18n

export default function useRegisterContextMenu<T extends HTMLElement>() {
  const config = useAppConfig()

  useEffect(() => {
    handleSaveOnConfigChanged()
  }, [])

  const handleContextMenu = useCallback<MouseEventHandler<T>>(
    (e) => {
      e.preventDefault()

      if (!config) {
        return undefined
      }

      const mainWindow = getCurrentWebviewWindow()
      if (!mainWindow) {
        return undefined
      }

      const fn = async () => {
        const menuItems = await Promise.all([
          Submenu.new({
            text: t("themeMode"),
            enabled: Boolean(config),
            items: (await Promise.all([
              CheckMenuItem.new({
                text: t("themeModeSystem"),
                checked: !config?.window.theme,
                action: async () => {
                  config.window.theme = null
                  await emit("configChanged", config)
                },
              }),
              CheckMenuItem.new({
                text: t("themeModeLight"),
                checked: config?.window.theme === "light",
                action: async () => {
                  config.window.theme = "light"
                  await emit("configChanged", config)
                },
              }),
              CheckMenuItem.new({
                text: t("themeModeDark"),
                checked: config?.window.theme === "dark",
                action: async () => {
                  config.window.theme = "dark"
                  await emit("configChanged", config)
                },
              }),
            ])) as unknown as MenuItem[],
          }),
          CheckMenuItem.new({
            text: t("alwaysOnTop"),
            checked: Boolean(config?.window.alwaysOnTop),
            enabled: Boolean(config),
            action: async () => {
              config.window.alwaysOnTop = !config.window.alwaysOnTop
              await emit("configChanged", config)

              if (!mainWindow) {
                return
              }

              await mainWindow.setAlwaysOnTop(config.window.alwaysOnTop)
            },
          }),
          CheckMenuItem.new({
            text: t("decoration"),
            checked: Boolean(config?.window.decoration),
            enabled: Boolean(config),
            action: async () => {
              config.window.decoration = !config.window.decoration
              await emit("configChanged", config)

              if (!mainWindow) {
                return
              }

              await mainWindow.setDecorations(config.window.decoration)
            },
          }),
          MenuItem.new({
            text: t("quit"),
            action: async () => {
              await invoke("quit")
            },
          }),
        ])

        const menu = await Menu.new({
          items: menuItems,
        })

        await menu.popup()
      }

      fn()
    },
    [config],
  )

  return handleContextMenu
}
