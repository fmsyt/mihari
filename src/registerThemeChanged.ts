import { type UnlistenFn, listen } from "@tauri-apps/api/event"
import type { AppConfig } from "./types"

let unListen: UnlistenFn | undefined = undefined

export default async function registerThemeChanged(
  handler: (theme: AppConfig["window"]["theme"]) => void,
) {
  if (unListen) {
    unListen()
  }

  unListen = await listen<AppConfig>("configChanged", (e) => {
    handler(e.payload.window.theme)
  })
}
