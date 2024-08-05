import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import registerConfigChanged from "./registerConfigChanged";
import { AppConfig } from "./types";

export default function handleSaveOnConfigChanged() {
  const handler = async (config: AppConfig) => {
    const json = JSON.stringify(config, null, 2);
    await writeTextFile("config.json", json, {
      baseDir: BaseDirectory.Config,
      append: false,
    });
  };

  registerConfigChanged(handler);
}
