import { Card, CardContent, type SxProps, type Theme } from "@mui/material"
import { type ReactNode, useMemo } from "react"

interface PanelProps {
  children?: ReactNode
  width?: number | string
  sx?: SxProps<Theme>
  padding?: number | string
}

export default function Panel(props: PanelProps) {
  const { padding: p } = props
  const padding = useMemo(() => p || "8px", [p])

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
          padding,
          height: `calc(100% - ${padding} * 2)`,
          "&:last-child": {
            paddingBottom: padding,
          },
        }}
      >
        {props.children}
      </CardContent>
    </Card>
  )
}
