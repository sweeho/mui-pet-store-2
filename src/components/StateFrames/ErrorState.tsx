"use client";

import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect } from "react";

/** The shared frame for a page or region that failed to load. Logs the error, offers a retry. */
export function ErrorState({
  title = "We couldn't load this page",
  error,
  onRetry,
}: {
  title?: string;
  error?: unknown;
  onRetry: () => void;
}) {
  useEffect(() => {
    if (error !== undefined) console.error("Page failed to load", error);
  }, [error]);

  return (
    <Card
      variant="outlined"
      role="alert"
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
          color: "error.main",
          display: "grid",
          placeItems: "center",
        }}
      >
        <IconAlertCircle size={20} stroke={1.7} aria-hidden />
      </Box>
      <Typography component="h2" variant="h3" sx={{ mt: 2, mb: 0.5, fontSize: "1.125rem" }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
        Something went wrong on our side. Try again in a moment.
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          mt: 2.5,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <Button
          variant="contained"
          startIcon={<IconRefresh size={16} aria-hidden />}
          onClick={onRetry}
          sx={{ height: { xs: 44, sm: 36 } }}
        >
          Try again
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          component={Link}
          href="/"
          sx={{ borderColor: "divider", height: { xs: 44, sm: 36 } }}
        >
          Go to home
        </Button>
      </Box>
    </Card>
  );
}
