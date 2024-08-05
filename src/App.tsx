import { Box, CssBaseline } from "@mui/material";

import MonitorContainer from "./components/MonitorContainer";
import ThemeProvider from "./ThemeProvider";
import useRegisterContextMenu from "./useRegisterContextMenu";

function App() {

  const handleContextMenu = useRegisterContextMenu();

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box
        component="div"
        onContextMenu={handleContextMenu}
        sx={{ width: "100%", height: "100svh" }}
      >
        <MonitorContainer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
