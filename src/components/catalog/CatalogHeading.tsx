"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/** The page's one h1 with its lead text (a string, or any node such as the search keywords). */
export function CatalogHeading({ title, lead }: { title: string; lead?: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: "1.375rem", sm: "1.5rem" }, fontWeight: 600, lineHeight: 1.25 }}
      >
        {title}
      </Typography>
      {lead ? (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {lead}
        </Typography>
      ) : null}
    </Box>
  );
}
