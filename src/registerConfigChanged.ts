import { Event, UnlistenFn, listen } from "@tauri-apps/api/event";
import { AppConfig } from "./types";

let unListen: UnlistenFn | undefined = undefined;

export default async function registerConfigChanged(handler: (config: AppConfig, e?: Event<AppConfig>) => void) {
  if (unListen) {
    unListen();
  }

  unListen = await listen<AppConfig>("configChanged", (e) => {
    handler(e.payload, e);
  });
}
