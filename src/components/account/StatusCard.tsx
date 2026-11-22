import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type Tone = "error" | "success" | "info";

/** A centred status panel: an icon, one heading, text, optional detail and the next actions. */
export function StatusCard({
  tone,
  icon,
  title,
  alert,
  children,
  actions,
}: {
  tone: Tone;
  icon: ReactNode;
  title: string;
  /** An error panel is announced when it appears. */
  alert?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const color = tone === "error" ? "error" : tone === "success" ? "success" : "primary";
  return (
    <Box
      component="section"
      role={alert ? "alert" : undefined}
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: { xs: 3, md: 5 },
        maxWidth: 640,
        mx: "auto",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: `${color}.light`,
          color: `${color}.main`,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h1" sx={{ fontSize: 24, fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
      {actions && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center", mt: 1 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}
