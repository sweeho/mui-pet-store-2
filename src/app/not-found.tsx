import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function NotFound() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h2">Not found</Typography>
      <Typography color="text.secondary">There is no page at this address.</Typography>
    </Box>
  );
}
