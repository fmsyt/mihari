import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { AppConfig } from "./types";
import registerConfigChanged from "./registerConfigChanged";

export default function handleSaveOnConfigChanged() {
  const handler = async (config: AppConfig) => {
    const json = JSON.stringify(config, null, 2);
    await writeTextFile("config.json", json, {
      baseDir: BaseDirectory.AppLocalData,
      append: false,
    });
  };

  registerConfigChanged(handler);
}
