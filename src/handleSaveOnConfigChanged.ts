import { fs } from "@tauri-apps/api";
import { BaseDirectory } from "@tauri-apps/api/fs";
import { AppConfig } from "./types";
import registerConfigChanged from "./registerConfigChanged";

export default function handleSaveOnConfigChanged() {
  const handler = async (config: AppConfig) => {
    const json = JSON.stringify(config, null, 2);
    await fs.writeTextFile("config.json", json, { dir: BaseDirectory.AppLocalData, append: false });
  }

  registerConfigChanged(handler);
}
