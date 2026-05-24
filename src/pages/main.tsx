import React from "react"
import ReactDOM from "react-dom/client"

import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"

import App from "../App"
import "./main.css"

document.addEventListener("mousedown", async (event) => {
  if (event.button !== 0) {
    return
  }

  await getCurrentWebviewWindow().startDragging()
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
