import { EmptyState } from "@/components/StateFrames/EmptyState";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function NotFound() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h1">Page not found</Typography>
      <EmptyState
        title="There is no page at this address"
        description="Check the address or go back to the home page."
      />
    </Box>
  );
}
