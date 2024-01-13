import { createTheme, ThemeProvider as MuiThemeProvider, useMediaQuery } from "@mui/material";
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { appWindow, Theme } from '@tauri-apps/api/window';
import { useEffect, useMemo, useState } from "react";

import ThemeContext from "./ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const initialThemeMode = localStorage.getItem("themeMode") as
  | "light"
  | "dark"
  | "system"
  | null;

const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  const { children } = props;

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
    initialThemeMode || "system",
  );

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [systemTheme, setSystemTheme] = useState<Theme | null>()
  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    (async () => {
      setSystemTheme(await appWindow.theme());

      unlisten = await listen<"light" | "dark" | "system">("themeChanged", ({ payload: theme }) => {
        setThemeMode(theme);
      });
    })();

    return () => {
      unlisten && unlisten();
    };
  }, []);



  const isDarkMode = useMemo(() => {
    switch (themeMode) {
      case "light":
        return false;
      case "dark":
        return true;
      case "system":
      default:
        if (systemTheme == null) {
          return prefersDarkMode;
        }
        return systemTheme === "dark";
    }
  }, [prefersDarkMode, themeMode, systemTheme]);

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
            }
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                color: isDarkMode ? "hsla(192, 10%, 90%, 0.9)" : "hsla(192, 10%, 4%, 0.9)",
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
  );

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode: (themeMode: "light" | "dark" | "system") => {
          localStorage.setItem("themeMode", themeMode);
          setThemeMode(themeMode);
        },
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
