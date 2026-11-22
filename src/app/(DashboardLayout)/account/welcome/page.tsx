import Typography from "@mui/material/Typography";
import { IconCircleCheck } from "@tabler/icons-react";

import { SignOnScreen } from "@/components/account/SignOnForm";
import { LinkButton } from "@/app/(DashboardLayout)/locale/LinkButton";
import { StatusCard } from "@/components/account/StatusCard";
import { getSignedOnCustomer } from "@/lib/customer-accounts/current";
import { getDomain } from "@/lib/customer-accounts/server";
import { getMessages } from "@/lib/localization/messages";
import { getRequestLocale } from "@/lib/localization/request";

/** The page after sign-on. */
export default async function WelcomePage() {
  const me = await getSignedOnCustomer();
  if (!me) return <SignOnScreen from="/account/welcome" failed />;
  const m = getMessages(await getRequestLocale());
  const account = await (await getDomain()).accounts.get(me.userName);
  const name = account?.contact.givenName || me.userName;
  return (
    <StatusCard
      tone="success"
      icon={<IconCircleCheck size={28} />}
      title={m["welcome.title"].replace("{name}", name)}
      actions={
        <>
          <LinkButton href="/catalog" variant="contained">
            {m["welcome.browse"]}
          </LinkButton>
          <LinkButton href="/account/profile" variant="text">
            {m["welcome.edit"]}
          </LinkButton>
        </>
      }
    >
      <Typography color="text.secondary">
        {m["welcome.body"].replace("{user}", me.userName)}
      </Typography>
      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
        {m["welcome.badge"]}
      </Typography>
    </StatusCard>
  );
}
