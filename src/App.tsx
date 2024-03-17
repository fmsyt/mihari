import { Box, CssBaseline } from "@mui/material";

import ThemeProvider from "./ThemeProvider";
import MonitorContainer from "./components/MonitorContainer";

function App() {

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ width: "100%", height: "100vh" }}>
        <MonitorContainer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
