import React from "react";
import ReactDOM from "react-dom/client";

import { CssBaseline } from "@mui/material";

import Config from "../Config";
import ThemeProvider from "../ThemeProvider";

import "../styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <Config />
    </ThemeProvider>
  </React.StrictMode>,
);
