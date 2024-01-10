import { useContext, useEffect, useState } from "react";
import { Button, ButtonGroup, Checkbox, Container, FormControl, FormControlLabel, FormLabel, Stack, Tooltip, Typography } from "@mui/material";
import { WebviewWindow } from "@tauri-apps/api/window";

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import i18n from "./i18n";

import ThemeContext from "./ThemeContext";

const mainWindow = WebviewWindow.getByLabel("main");


function App() {

  if (!mainWindow) {
    throw new Error("main window not found");
  }

  const { themeMode, setThemeMode } = useContext(ThemeContext);
  const [isTopMost, setIsTopMost] = useState<boolean>(true);
  const [decoration, setDecoration] = useState<boolean>(false);

  const handleChangeTopMost = async (toEnable: boolean) => {
    if (toEnable) {
      await mainWindow.setAlwaysOnTop(true);
      setIsTopMost(true);
    } else {
      await mainWindow.setAlwaysOnTop(false);
      setIsTopMost(false);
    }
  }

  const handleChangeThemeMode = async (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
  }

  const handleChangeDecoration = async (toEnable: boolean) => {
    await mainWindow.setDecorations(toEnable);
    setDecoration(toEnable);
  }

  useEffect(() => {
    return () => {
      handleChangeDecoration(false);
    }
  }, [])


  return (
    <Container>
      <Stack spacing={2}>
        <Typography variant="h6">{i18n.t("title")}</Typography>
        <FormControl>
          <FormLabel>{i18n.t("themeMode")}</FormLabel>
          <ButtonGroup size="small">
            <Tooltip title="System">
              <Button
                variant={themeMode === "system" ? "contained" : "outlined"}
                onClick={() => { handleChangeThemeMode("system") }}
                startIcon={themeMode === "system" ? <SettingsBrightnessIcon /> : undefined}
                sx={{ textTransform: "none" }}
              >
                {themeMode === "system" ? "System" : <SettingsBrightnessIcon />}
              </Button>
            </Tooltip>
            <Tooltip title="Light">
              <Button
                variant={themeMode === "light" ? "contained" : "outlined"}
                onClick={() => { handleChangeThemeMode("light") }}
                startIcon={themeMode === "light" ? <LightModeIcon /> : undefined}
                sx={{ textTransform: "none" }}
              >
                {themeMode === "light" ? "Light" : <LightModeIcon />}
              </Button>
            </Tooltip>
            <Tooltip title="Dark">
              <Button
                variant={themeMode === "dark" ? "contained" : "outlined"}
                onClick={() => { handleChangeThemeMode("dark") }}
                startIcon={themeMode === "dark" ? <DarkModeIcon /> : undefined}
                sx={{ textTransform: "none" }}
              >
                {themeMode === "dark" ? "Dark" : <DarkModeIcon />}
              </Button>
            </Tooltip>
          </ButtonGroup>
        </FormControl>

        <FormControlLabel
          label={i18n.t("alwaysOnTop")}
          control={(
            <Checkbox
              checked={isTopMost === true}
              onChange={(e) => { handleChangeTopMost(e.target.checked) }}
            />
          )}
        />

        <FormControlLabel
          label={i18n.t("decoration")}
          control={(
            <Checkbox
              checked={decoration === true}
              onChange={(e) => { handleChangeDecoration(e.target.checked) }}
            />
          )}
        />
      </Stack>

    </Container>
  );
}

export default App;
