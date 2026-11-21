import { IconInbox } from "@tabler/icons-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

/** The shared frame for a page or region with nothing to show. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        py: 8,
        px: 3,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: "primary.light",
          color: "primary.main",
          display: "grid",
          placeItems: "center",
        }}
      >
        <IconInbox size={20} stroke={1.7} aria-hidden />
      </Box>
      <Typography component="h2" variant="h3" sx={{ mt: 2, mb: 0.5, fontSize: "1.125rem" }}>
        {title}
      </Typography>
      {description ? (
        <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2.5 }}>{action}</Box> : null}
    </Card>
  );
}
