import { Button, ButtonGroup, Card, CardContent, CardHeader, Checkbox, Container, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, Tooltip, Typography } from "@mui/material";
import { emit } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";
import { useCallback, useContext, useMemo, useRef, useState } from "react";

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import i18n from "./i18n";
import ThemeContext from "./ThemeContext";
import { CpuConfig } from "./types";
import useAppConfig from "./useAppConfig";

const { t } = i18n;

function App() {

  const mainWindowRef = useRef<WebviewWindow | null>(WebviewWindow.getByLabel("main"));


  const { themeMode, setThemeMode } = useContext(ThemeContext);
  const [isTopMost, setIsTopMost] = useState<boolean>(true);
  const [decoration, setDecoration] = useState<boolean>(false);

  const handleChangeTopMost = async (toEnable: boolean) => {

    if (!mainWindowRef.current) {
      return;
    }

    const mainWindow = mainWindowRef.current;

    if (toEnable) {
      await mainWindow.setAlwaysOnTop(true);
      setIsTopMost(true);
    } else {
      await mainWindow.setAlwaysOnTop(false);
      setIsTopMost(false);
    }
  }

  const handleChangeThemeMode = useCallback(async (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    emit("themeChanged", mode);
  }, [])

  const handleChangeDecoration = async (toEnable: boolean) => {
    if (!mainWindowRef.current) {
      return;
    }

    await mainWindowRef.current.setDecorations(toEnable);
    setDecoration(toEnable);
  }



  return (
    <Container>
      <Stack spacing={2}>
        <Typography variant="h5">{t("title")}</Typography>

        <Card>
          <CardHeader title={t("windowConfigTitle")} />

          <CardContent>
            <FormControl>
              <FormLabel>{t("themeMode")}</FormLabel>
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
          </CardContent>

          <CardContent>
            <FormControl>
              <FormControlLabel
                label={t("alwaysOnTop")}
                control={(
                  <Checkbox
                    checked={isTopMost === true}
                    onChange={(e) => { handleChangeTopMost(e.target.checked) }}
                  />
                )}
              />

              <FormControlLabel
                label={t("decoration")}
                control={(
                  <Checkbox
                    checked={decoration === true}
                    onChange={(e) => { handleChangeDecoration(e.target.checked) }}
                  />
                )}
              />

            </FormControl>
          </CardContent>

        </Card>

        <Card>
          <CardHeader title={t("cpu")} />
          <CardContent>
            <CpuConfigForm />
          </CardContent>
        </Card>

      </Stack>

    </Container>
  );
}

const CpuConfigForm = () => {

  const currentConfig = useAppConfig();

  const cpuConfig = useMemo(() => currentConfig?.monitor.cpu, [currentConfig?.monitor.cpu]);

  const handleEmit = useCallback((next: CpuConfig) => {

    if (!currentConfig || !cpuConfig) {
      return;
    }

    emit("configChanged", {
      ...currentConfig,
      monitor: {
        ...currentConfig.monitor,
        cpu: next,
      }
    });

  }, [cpuConfig]);

  const handleChange = useCallback((key: keyof CpuConfig, value: any) => {

    if (!cpuConfig) {
      return;
    }

    const next = {
      ...cpuConfig,
      [key]: value,
    };

    handleEmit(next);


  }, [cpuConfig, handleEmit]);

  return (
    <FormControl>
      <FormLabel>{t("cpuDisplayContentHeader")}</FormLabel>
      <RadioGroup
        defaultValue={cpuConfig?.showAggregated ? "aggregate" : "logical"}
        onChange={(e) => { handleChange("showAggregated", e.target.value === "aggregate") }}
      >
        <FormControlLabel
          label={t("cpuDisplayContentAggregate")}
          value="aggregate"
          control={<Radio />}
        />
        <FormControlLabel
          label={t("cpuDisplayContentLogical")}
          value="logical"
          control={<Radio />}
        />
      </RadioGroup>
    </FormControl>
  )
}

export default App;
