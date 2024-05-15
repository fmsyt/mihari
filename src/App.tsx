import { Box, CssBaseline } from "@mui/material";

import ThemeProvider from "./ThemeProvider";
import MonitorContainer from "./components/MonitorContainer";
import ContextMenuContainer from "./ContextMenuContainer";

function App() {

  return (
    <ThemeProvider>
      <CssBaseline />
      <ContextMenuContainer>
        <Box sx={{ width: "100%", height: "100vh" }}>
          <MonitorContainer />
        </Box>
      </ContextMenuContainer>
    </ThemeProvider>
  );
}

export default App;
