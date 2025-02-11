import { createContext } from "react"

interface ThemeContextProps {
  themeMode: "light" | "dark" | "system"
  isDarkMode: boolean
}

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "system",
  isDarkMode: false,
})

export default ThemeContext
