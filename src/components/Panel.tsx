import { Paper } from "@mui/material";
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
        width: props.width || "100%",
        height: "100%",
        maxHeight: "100%",
        backgroundColor: "hsla(192, 60%, 4%, 0.9)",
        justifyContent: props.justifyContent ?? "start",
        alignItems: props.alignItems ?? "start",
        overflow: "hidden",
      }}
    >
      {props.children}
    </Paper>
  )
}
