import { Box, Paper } from "@mui/material";
import { ReactNode } from "react";

interface PanelProps {
  children?: ReactNode;
  width?: number | string;
  justifyContent?: "start" | "center" | "end";
  alignItems?: "start" | "center" | "end";
}

export default function Panel(props: PanelProps) {
  return (
    <Paper
      sx={{
        display: "flex",
        width: props.width || "100%",
        height: "100%",
        backgroundColor: "hsla(192, 60%, 4%, 0.8)",
        justifyContent: props.justifyContent ?? "start",
        alignItems: props.alignItems ?? "start",
      }}
    >
      <Box width="100%" height="100%" margin={1}>
        {props.children}
      </Box>
    </Paper>
  )
}
