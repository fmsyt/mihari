import { Button, ButtonGroup, Card, CardContent, CardHeader, Checkbox, CircularProgress, Container, CssBaseline, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, ThemeProvider, Tooltip, Typography, createTheme, useMediaQuery } from "@mui/material";
import { useCallback, useMemo, useState } from "react";

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { emit } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";

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
          },
        }
      },
    },
  });

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

    emit("configChanged", {
      ...config,
      window: {
        ...config.window,
        theme: mode,
      }
    });

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

  const [isTopMost, setIsTopMost] = useState<boolean>(true);
  const [decoration, setDecoration] = useState<boolean>(false);

  const handleChangeTopMost = useCallback(async (toEnable: boolean) => {

    if (!mainWindow) {
      return;
    }


    if (toEnable) {
      await mainWindow.setAlwaysOnTop(true);
      setIsTopMost(true);
    } else {
      await mainWindow.setAlwaysOnTop(false);
      setIsTopMost(false);
    }
  }, [mainWindow])


  const handleChangeDecoration = useCallback(async (toEnable: boolean) => {
    if (!mainWindow) {
      return;
    }

    await mainWindow.setDecorations(toEnable);
    setDecoration(toEnable);
  }, [mainWindow])


  return (
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
  )
}


const CpuConfigForm = (props: FormProps) => {

  const { config } = props;
  const cpuConfig = useMemo(() => config.monitor.cpu, [config.monitor.cpu]);

  const handleEmit = useCallback((next: CpuConfig) => {

    emit("configChanged", {
      ...config,
      monitor: {
        ...config.monitor,
        cpu: next,
      }
    });

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
