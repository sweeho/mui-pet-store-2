import Box from "@mui/material/Box";
import { IconPaw } from "@tabler/icons-react";

/** The store mark: a paw on the primary colour. */
export function BrandLogo() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        display: "grid",
        placeItems: "center",
        flex: "none",
      }}
    >
      <IconPaw size={18} stroke={1.7} />
    </Box>
  );
}
