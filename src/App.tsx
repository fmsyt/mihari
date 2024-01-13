import { Box, CssBaseline } from "@mui/material";
import { useLayoutEffect, useState } from "react";

import ThemeProvider from "./ThemeProvider";
import Monitor from "./components/Monitor";
import { ResourceGroup } from "./types";
import useAppConfig from "./useAppConfig";
import createResourceList from "./createResourceList";

function App() {
  const [resources, setResources] = useState<ResourceGroup[]>([]);

  const config = useAppConfig();
  useLayoutEffect(() => {
    if (config == null) {
      return;
    }

    setResources([]);

    (async () => {
      const resources = await createResourceList(config);
      setResources(resources);
    })();

  }, [config]);

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ width: "100%", height: "100vh" }}>
        <Monitor resources={resources} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
