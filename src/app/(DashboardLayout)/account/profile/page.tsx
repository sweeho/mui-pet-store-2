import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { eq } from "drizzle-orm";
import Link from "next/link";

import { ProfileForm, type ProfileValues } from "@/components/account/ProfileForm";
import { SignOnScreen } from "@/components/account/SignOnForm";
import { getDb } from "@/db/client";
import { categoryDetails } from "@/db/schema";
import { getSignedOnCustomer } from "@/lib/customer-accounts/current";
import { getDomain } from "@/lib/customer-accounts/server";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { getMessages } from "@/lib/localization/messages";
import { getRequestLocale } from "@/lib/localization/request";

/** The profile form. Needs a signed-on customer; otherwise the sign-on screen, back here afterwards. */
export default async function ProfilePage() {
  const me = await getSignedOnCustomer();
  if (!me) return <SignOnScreen from="/account/profile" failed />;
  const locale = await getRequestLocale();
  const m = getMessages(locale);
  const domain = await getDomain();
  const account = await domain.accounts.get(me.userName);
  const profile = await domain.profiles.get(me.userName);
  const [expiryMonth = "", expiryYear = ""] = (account?.card.expiry ?? "").split("/");
  const initial: ProfileValues = {
    givenName: account?.contact.givenName ?? "",
    familyName: account?.contact.familyName ?? "",
    email: account?.contact.email ?? "",
    telephone: account?.contact.telephone ?? "",
    street1: account?.contact.address.street1 ?? "",
    street2: account?.contact.address.street2 ?? "",
    city: account?.contact.address.city ?? "",
    state: account?.contact.address.state ?? "",
    zip: account?.contact.address.zip ?? "",
    country: account?.contact.address.country ?? "",
    cardType: account?.card.type ?? "",
    cardLast4: account?.card.number?.slice(-4) ?? "",
    expiryMonth,
    expiryYear,
    language: profile?.language ?? "en_US",
    favoriteCategory: profile?.favoriteCategory ?? "",
    myList: profile?.myList ?? true,
    banner: profile?.banner ?? true,
  };
  const db = await getDb();
  const names = await db.select().from(categoryDetails).where(eq(categoryDetails.locale, locale));
  const categories = names
    .map((c) => ({ value: c.categoryId, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="nav"
          aria-label="Breadcrumb"
        >
          <Link href="/" style={{ color: "inherit" }}>
            {m["menu.home"]}
          </Link>{" "}
          / {m["menu.account"]} / {m["profile.title"]}
        </Typography>
        <Typography variant="h1">{m["profile.title"]}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
          {m["profile.intro"]}
        </Typography>
      </Box>
      <ProfileForm
        initial={initial}
        languages={SUPPORTED_LOCALES.map((l) => ({ value: l.code, label: l.label }))}
        categories={categories}
      />
    </Box>
  );
}
