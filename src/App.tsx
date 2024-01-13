import { Box, CssBaseline, Skeleton } from "@mui/material";
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
    if (config == null) {
      return;
    }

    setResources([]);

    (async () => {
      setIsLoading(true);

      const resources = await createResourceList(config);
      setResources(resources);

      setIsLoading(false);
    })();

  }, [config]);

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

        {!isLoading && (
          <Monitor resources={resources} />
        )}

      </Box>
    </ThemeProvider>
  );
}

export default App;
