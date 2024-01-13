import { Button, ButtonGroup, Card, CardContent, CardHeader, Checkbox, CircularProgress, Container, CssBaseline, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, ThemeProvider, Tooltip, Typography, createTheme, useMediaQuery } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { UnlistenFn, emit, listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";

import i18n from "./i18n";
import { AppConfig, CpuConfig } from "./types";
import useAppConfig from "./useAppConfig";
import { fs } from "@tauri-apps/api";
import { BaseDirectory } from "@tauri-apps/api/fs";

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
          },
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

              <Card>
                <CardHeader title={t("cpu")} />
                <CardContent>
                  <CpuConfigForm
                    config={config}
                  />
                </CardContent>
              </Card>
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
            checked={alwaysOnTop === true}
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
  )
}


const CpuConfigForm = (props: FormProps) => {

  const { config } = props;
  const cpuConfig = useMemo(() => config.monitor.cpu, [config.monitor.cpu]);

  const handleEmit = useCallback((next: CpuConfig) => {
    config.monitor = { ...config.monitor, cpu: next };
    emit("configChanged", config);

  }, [config]);

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
        defaultValue={cpuConfig.showAggregated ? "aggregate" : "logical"}
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
