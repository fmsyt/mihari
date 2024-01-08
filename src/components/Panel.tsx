import { Card, CardContent, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

interface PanelProps {
  children?: ReactNode;
  width?: number | string;
  sx?: SxProps<Theme>;
}

export default function Panel(props: PanelProps) {
  return (
    <Card
      sx={{
        width: props.width,
        height: "100%",
        maxHeight: "100%",
        overflow: "hidden",
        ...props.sx,
      }}
      square
    >
      <CardContent
        sx={{
          padding: "8px",
          height: "calc(100% - 16px)",
          "&:last-child": {
            paddingBottom: "8px",
          },
        }}
      >
        {props.children}
      </CardContent>
    </Card>
  );
}
