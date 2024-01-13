import { Box, CssBaseline, Paper, Skeleton, Typography } from "@mui/material";
import { useLayoutEffect, useState } from "react";

import ThemeProvider from "./ThemeProvider";
import Monitor from "./components/Monitor";
import { ResourceGroup } from "./types";
import useAppConfig from "./useAppConfig";
import createResourceList from "./createResourceList";

function App() {
  const [resources, setResources] = useState<ResourceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const config = useAppConfig();
  useLayoutEffect(() => {
    if (!config?.monitor) {
      return;
    }

    setResources([]);

    (async () => {
      setIsLoading(true);

      const resources = await createResourceList(config.monitor);
      setResources(resources);

      setIsLoading(false);
    })();

  }, [config?.monitor]);

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ width: "100%", height: "100vh" }}>

        {isLoading && (
          <Skeleton
            variant="rounded"
            animation="wave"
            height="100%"
          />
        )}

        {!isLoading && resources.length === 0 && (
          <Paper
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.5rem",
            }}
          >
            <Typography>
              No resources found
            </Typography>
          </Paper>
        )}

        {!isLoading && resources.length > 0 && (
          <Monitor resources={resources} />
        )}

      </Box>
    </ThemeProvider>
  );
}

export default App;
