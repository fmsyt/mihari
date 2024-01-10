import { window as tauriWindow } from "@tauri-apps/api";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "../App";
import "../styles.css";

document.addEventListener("mousedown", async (_) => {
  await tauriWindow.appWindow.startDragging();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
