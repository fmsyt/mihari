import { createContext } from "react";

interface ThemeContextProps {
  themeMode: "light" | "dark" | "system";
  setThemeMode: (themeMode: "light" | "dark" | "system") => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "system",
  setThemeMode: () => { },
});

export default ThemeContext;
