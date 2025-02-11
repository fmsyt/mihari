import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material"

import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import type { Theme } from "@tauri-apps/api/window"

import { useEffect, useMemo, useState } from "react"

import ThemeContext from "./ThemeContext"
import { getAppConfig } from "./api"
import registerThemeChanged from "./registerThemeChanged"

interface ThemeProviderProps {
  children: React.ReactNode
}

const initialThemeMode = localStorage.getItem("themeMode") as
  | "light"
  | "dark"
  | "system"
  | null

const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  const { children } = props

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
    initialThemeMode || "system",
  )

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

  const [systemTheme, setSystemTheme] = useState<Theme | null>()
  useEffect(() => {
    registerThemeChanged((theme) => setThemeMode(theme || "system"))

    getAppConfig().then((config) => {
      setThemeMode(config.window.theme || "system")
    })

    getCurrentWebviewWindow()
      .theme()
      .then((theme) => {
        setSystemTheme(theme)
      })
  }, [])

  const isDarkMode = useMemo(() => {
    switch (themeMode) {
      case "light":
        return false
      case "dark":
        return true
      default:
        if (systemTheme == null) {
          return prefersDarkMode
        }
        return systemTheme === "dark"
    }
  }, [prefersDarkMode, themeMode, systemTheme])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              ":root": {
                colorScheme: isDarkMode ? "dark" : "light",
                fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif",
                fontSynthesis: "none",
                textRendering: "optimizeLegibility",
              },
              body: {
                backgroundColor: "transparent",
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                color: isDarkMode
                  ? "hsla(192, 10%, 90%, 0.9)"
                  : "hsla(192, 10%, 4%, 0.9)",
              },
              caption: {
                fontSize: "0.7rem",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode
                  ? "hsla(192, 10%, 4%, 0.9)"
                  : "hsla(192, 10%, 90%, 0.9)",
              },
            },
          },
        },
      }),
    [isDarkMode],
  )

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
