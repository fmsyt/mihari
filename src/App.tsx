import { Box, CssBaseline } from "@mui/material";

import ThemeProvider from "./ThemeProvider";
import Monitor from "./components/Monitor";
import useAppConfig from "./useAppConfig";

function App() {

  const { resources } = useAppConfig();

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
