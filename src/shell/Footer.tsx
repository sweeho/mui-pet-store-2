import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { APP_NAME } from "@/constants/app";

/** The shared footer, below the page content on every page. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        px: { xs: 2, sm: 4 },
        py: 2,
      }}
    >
      <Typography component="span" variant="body2" color="text.secondary">
        © 2026 {APP_NAME}
      </Typography>
    </Box>
  );
}
