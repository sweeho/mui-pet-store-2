import { LocalesList } from "./LocalesList";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function LocalizationPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h1">Localization</Typography>
        <Typography color="text.secondary">The languages the store supports.</Typography>
      </Box>
      <LocalesList />
    </Box>
  );
}
