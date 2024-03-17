import { Box, Button, ButtonGroup, Card, CardContent, CardHeader, Checkbox, CircularProgress, Container, CssBaseline, FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, Stack, ThemeProvider, Tooltip, Typography, createTheme, useMediaQuery } from "@mui/material";
import { fs } from "@tauri-apps/api";
import { UnlistenFn, emit, listen } from "@tauri-apps/api/event";
import { BaseDirectory } from "@tauri-apps/api/fs";
import { WebviewWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useMemo } from "react";

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import i18n from "./i18n";
import { AppConfig, CpuConfig } from "./types";
import useAppConfig from "./useAppConfig";

const { t } = i18n;

function App() {

  const mainWindow = WebviewWindow.getByLabel("main");
  const config = useAppConfig();

  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = createTheme({
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
            margin: "8px",
          }
        }
      },
    },
  });

  useEffect(() => {
    let unlisten: UnlistenFn | undefined = undefined;

    (async () => {
      unlisten = await listen<AppConfig>("configChanged", async ({ payload }) => {
        const json = JSON.stringify(payload, null, 2);
        await fs.writeTextFile("config.json", json, { dir: BaseDirectory.AppLocalData, append: false });
      });
    })();

    return () => {
      unlisten && unlisten();
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Stack spacing={2}>
          <Typography variant="h5">{t("title")}</Typography>

          {!config && (
            <Stack justifyContent="center" alignItems="center">
              <CircularProgress />
            </Stack>
          )}

          {config && (
            <>
              <Card>
                <CardHeader title={t("windowConfigTitle")} />

                <CardContent>
                  <WindowConfigThemeForm
                    config={config}
                  />
                </CardContent>

                <CardContent>
                  <WindowConfigStateForm
                    config={config}
                    mainWindow={mainWindow}
                  />
                </CardContent>

              </Card>

              <Box hidden>
                <Card>
                  <CardHeader title={t("cpu")} />
                  <CpuConfigContents
                    config={config}
                  />
                </Card>
              </Box>
            </>
          )}


        </Stack>

      </Container>
    </ThemeProvider>

  );
}


interface FormProps {
  config: AppConfig;
}


const WindowConfigThemeForm = (props: FormProps) => {

  const { config } = props;
  const themeMode = useMemo(() => config.window.theme || "system", [config.window.theme]);

  const handleEmit = useCallback((mode: "light" | "dark" | "system") => {
    config.window.theme = mode === "system" ? null : mode;
    emit("configChanged", config);

  }, [config]);

  const handleChangeThemeMode = useCallback(async (mode: "light" | "dark" | "system") => {
    handleEmit(mode);
    emit("themeChanged", mode);
  }, [handleEmit])

  return (
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
  )
}

interface WindowConfigStateFormProps extends FormProps {
  mainWindow?: WebviewWindow | null;
}

const WindowConfigStateForm = (props: WindowConfigStateFormProps) => {

  const { mainWindow } = props;

  const { config } = props;

  const alwaysOnTop = useMemo(() => config.window.alwaysOnTop, [config.window.alwaysOnTop]);
  const decoration = useMemo(() => config.window.decoration, [config.window.decoration]);

  const handleChangeTopMost = useCallback(async (toEnable: boolean) => {

    config.window.alwaysOnTop = toEnable;
    emit("configChanged", config);

    if (!mainWindow) {
      return;
    }

    if (toEnable) {
      await mainWindow.setAlwaysOnTop(true);
    } else {
      await mainWindow.setAlwaysOnTop(false);
    }
  }, [config, mainWindow])

  const handleChangeDecoration = useCallback(async (toEnable: boolean) => {

    config.window.decoration = toEnable;
    emit("configChanged", config);

    if (!mainWindow) {
      return;
    }

    await mainWindow.setDecorations(toEnable);

  }, [mainWindow])


  return (
    <FormControl>
      <FormControlLabel
        label={t("alwaysOnTop")}
        control={(
          <Checkbox
            checked={alwaysOnTop}
            onChange={(e) => { handleChangeTopMost(e.target.checked) }}
          />
        )}
      />

      <FormControlLabel
        label={t("decoration")}
        control={(
          <Checkbox
            checked={decoration}
            onChange={(e) => { handleChangeDecoration(e.target.checked) }}
          />
        )}
      />

    </FormControl>
  )
}


const CpuConfigContents = (props: FormProps) => {

  const { config } = props;
  const cpuConfig = useMemo(() => config.monitor.cpu, [config.monitor.cpu]);

  const handleEmit = useCallback((next: CpuConfig) => {
    config.monitor = { ...config.monitor, cpu: next };
    emit("configChanged", config);

  }, [config]);

  const handleChange = useCallback((key: keyof CpuConfig, value: any) => {

    const next = {
      ...cpuConfig,
      [key]: value,
    };

    handleEmit(next);


  }, [cpuConfig, handleEmit]);

  const helperText = useMemo(() => {

    switch (cpuConfig.excludeIdle) {
      case true:
        return t("cpuDisplayCalculationExcludeIdleHelper");
      case false:
        return t("cpuDisplayCalculationIncludeIdleHelper");
    }

  }, [cpuConfig.excludeIdle]);

  return (
    <>
      <CardContent>
        <FormControl>
          <FormLabel>{t("cpuDisplayContentHeader")}</FormLabel>
          <RadioGroup
            value={cpuConfig.showAggregated ? "aggregate" : "logical"}
            onChange={(e) => { handleChange("showAggregated", e.target.value === "aggregate") }}
          >
            <FormControlLabel
              label={t("cpuDisplayContentLogical")}
              value="logical"
              control={<Radio />}
            />
            <FormControlLabel
              label={t("cpuDisplayContentAggregate")}
              value="aggregate"
              control={<Radio />}
            />
          </RadioGroup>
        </FormControl>
      </CardContent>

      <CardContent>
        <FormControl>
          <FormLabel>{t("cpuDisplayCalculationHeader")}</FormLabel>
          <RadioGroup
            value={cpuConfig.excludeIdle ? "exclude" : "include"}
            onChange={(e) => { handleChange("excludeIdle", e.target.value === "exclude") }}
          >
            <FormControlLabel
              label={t("cpuDisplayCalculationIncludeIdle")}
              value="include"
              control={<Radio />}
            />
            <FormControlLabel
              label={t("cpuDisplayCalculationExcludeIdle")}
              value="exclude"
              control={<Radio />}
            />
          </RadioGroup>

          <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
      </CardContent>
    </>
  )
}

export default App;
