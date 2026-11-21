import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";

/** The shared frame while a page or region loads. Announced as a status. */
export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <Card variant="outlined" role="status" aria-label={label} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Skeleton variant="rounded" width="40%" height={20} />
        <Skeleton variant="rounded" height={16} />
        <Skeleton variant="rounded" height={16} />
        <Skeleton variant="rounded" width="70%" height={16} />
      </Box>
    </Card>
  );
}
