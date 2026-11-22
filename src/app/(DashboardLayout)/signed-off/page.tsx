import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconLogout } from "@tabler/icons-react";

import { LinkButton } from "@/app/(DashboardLayout)/locale/LinkButton";
import { StatusCard } from "@/components/account/StatusCard";
import { findSupportedLocale } from "@/lib/locales";
import { getMessages } from "@/lib/localization/messages";
import { getLocaleContext } from "@/lib/localization/request";

/** The sign-off confirmation: the session ended and only the language was kept. */
export default async function SignedOffPage() {
  const { chosen, locale } = await getLocaleContext();
  const m = getMessages(locale);
  const name = findSupportedLocale(chosen)?.label ?? chosen;
  return (
    <StatusCard
      tone="success"
      icon={<IconLogout size={28} />}
      title={m["signedoff.title"]}
      actions={
        <>
          <LinkButton href="/signin" variant="contained">
            {m["signedoff.again"]}
          </LinkButton>
          <LinkButton href="/" variant="outlined">
            {m["error.home"]}
          </LinkButton>
        </>
      }
    >
      <Typography color="text.secondary">{m["signedoff.body"]}</Typography>
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, color: "text.secondary" }}>
        <li>{m["signedoff.cart"]}</li>
        <li>{m["signedoff.locale"].replace("{name}", name)}</li>
      </Box>
    </StatusCard>
  );
}
