import { useMemo, useState } from "react";
import ThemeContext from "./ThemeContext";
import { ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery } from "@mui/material";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const initialThemeMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;

const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {

  const { children } = props;

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(initialThemeMode || "system");

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isDarkMode = useMemo(() => {
    switch (themeMode) {
      case "light":
        return false;
      case "dark":
        return true;
      case "system":
        return prefersDarkMode;
    }
  }, [prefersDarkMode, themeMode]);

  const theme = useMemo(() => createTheme({

    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode
              ? "hsla(192, 10%, 4%, 0.9)"
              : "hsla(192, 10%, 90%, 0.9)",
          },
        },
      }
    }
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{
      themeMode,
      setThemeMode: (themeMode: "light" | "dark" | "system") => {
        localStorage.setItem("themeMode", themeMode);
        setThemeMode(themeMode);
      },
    }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
