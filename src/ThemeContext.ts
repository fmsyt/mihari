import { createContext } from "react";

interface ThemeContextProps {
  themeMode: "light" | "dark" | "system";
}

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "system",
});

export default ThemeContext;
