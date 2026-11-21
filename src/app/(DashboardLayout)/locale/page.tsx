import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { getMessages } from "@/lib/localization/messages";
import { getLocaleContext } from "@/lib/localization/request";
import { safeFrom } from "@/lib/problem";

import { LocaleChoices } from "./LocaleChoices";

/** The language page: the choices, the current one checked. */
export default async function LocalePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { chosen, locale } = await getLocaleContext();
  const m = getMessages(locale);
  const { from, error } = await searchParams;
  return (
    <Box data-screen="locale" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h1">{m["locale.title"]}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {m["locale.description"]}
        </Typography>
      </Box>
      {error === "invalid" && (
        <Alert severity="error" role="alert" sx={{ maxWidth: 640 }}>
          {m["locale.error"]}
        </Alert>
      )}
      <LocaleChoices current={chosen} from={safeFrom(from)} />
    </Box>
  );
}
