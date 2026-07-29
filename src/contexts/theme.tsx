import { Theme } from "@emotion/react"
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  useMediaQuery,
} from "@mui/material"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import { createContext, ReactNode, useEffect, useMemo, useState } from "react"
import { getAppConfig } from "../api"
import registerThemeChanged from "../registerThemeChanged"

export type ThemeContextProps = {
  themeMode: "light" | "dark" | "system"
  isDarkMode: boolean
}

export const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "system",
  isDarkMode: false,
})

export type ThemeProviderProps = {
  children: ReactNode
}

const initialThemeMode = localStorage.getItem("themeMode") as
  | "light"
  | "dark"
  | "system"
  | null

export const ThemeProvider = (props: ThemeProviderProps) => {
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
      <MuiThemeProvider theme={theme}> {children} </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
