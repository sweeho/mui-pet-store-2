import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { LinkButton } from "@/app/(DashboardLayout)/locale/LinkButton";
import { SignOnScreen } from "@/components/account/SignOnForm";
import { getSignedOnCustomer } from "@/lib/customer-accounts/current";
import { getMessages } from "@/lib/localization/messages";
import { getRequestLocale } from "@/lib/localization/request";

/** The account overview. Needs a signed-on customer; otherwise the sign-on screen, back here afterwards. */
export default async function CustomerPage() {
  const me = await getSignedOnCustomer();
  if (!me) return <SignOnScreen from="/customer" failed />;
  const m = getMessages(await getRequestLocale());
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h1">{m["customer.title"]}</Typography>
      <Typography color="text.secondary">
        {m["customer.intro"].replace("{user}", me.userName)}
      </Typography>
      <Box>
        <LinkButton href="/account/profile" variant="contained">
          {m["customer.profile"]}
        </LinkButton>
      </Box>
    </Box>
  );
}
