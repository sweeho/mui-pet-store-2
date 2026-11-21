import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { EmptyState } from "@/components/StateFrames/EmptyState";

export default function OrderAdministrationPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h1">Order administration</Typography>
        <Typography color="text.secondary">Approve or deny pending orders.</Typography>
      </Box>
      <EmptyState
        title="No orders yet"
        description="Orders waiting for review will show up here."
      />
    </Box>
  );
}
