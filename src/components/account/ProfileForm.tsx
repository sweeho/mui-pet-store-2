"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { startTransition, useActionState } from "react";

import { useT } from "@/lib/localization/LocaleProvider";
import type { MessageKey } from "@/lib/localization/messages";

import { Field, SelectField } from "./Field";
import { saveProfileAction, type ProfileState } from "./actions";

export type ProfileValues = {
  givenName: string;
  familyName: string;
  email: string;
  telephone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  cardType: string;
  /** The last four digits of the saved card, if one is saved. */
  cardLast4: string;
  expiryMonth: string;
  expiryYear: string;
  language: string;
  favoriteCategory: string;
  myList: boolean;
  banner: boolean;
};

type Option = { value: string; label: string };

const FIELD_LABEL: Record<string, MessageKey> = {
  givenName: "profile.firstName",
  familyName: "profile.lastName",
  email: "profile.email",
  telephone: "profile.telephone",
  street1: "profile.street1",
  city: "profile.city",
  state: "profile.state",
  zip: "profile.zip",
  country: "profile.country",
  language: "profile.language",
};

const COUNTRIES: Option[] = [
  { value: "US", label: "United States" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "DE", label: "Germany" },
];
const CARD_TYPES: Option[] = [
  { value: "VISA", label: "Visa" },
  { value: "MC", label: "MasterCard" },
  { value: "AMEX", label: "American Express" },
];
const MONTHS: Option[] = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, "0");
  return { value: m, label: m };
});

const card = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  p: 3,
} as const;
const grid = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
  gap: 2,
} as const;

/** The profile form: contact, address, card and preferences. A refused save names each empty required field. */
export function ProfileForm({
  initial,
  languages,
  categories,
}: {
  initial: ProfileValues;
  languages: Option[];
  categories: Option[];
}) {
  const t = useT();
  const [state, save, pending] = useActionState<ProfileState, FormData>(saveProfileAction, {});
  const missing = new Set(state.missing ?? []);
  const label = (key: string) => t(FIELD_LABEL[key] ?? "profile.title");
  const error = (key: string) =>
    missing.has(key) ? t("profile.required", { field: label(key) }) : undefined;
  const year = new Date().getFullYear();
  const years: Option[] = Array.from({ length: 12 }, (_, i) => {
    const y = String(year + i);
    return { value: y, label: y };
  });
  return (
    <Box
      component="form"
      noValidate
      // Not `action`: React would reset the fields after a refused save.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => save(data));
      }}
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 920 }}
    >
      {state.saved && (
        <Alert severity="success" role="status">
          {t("profile.saved")}
        </Alert>
      )}
      {missing.size > 0 && (
        <Alert severity="error" role="alert">
          <b>{t("profile.refused")}</b> {t("profile.refused.some")}{" "}
          {[...missing].map((key) => label(key)).join(", ")}
        </Alert>
      )}
      {state.signOnRequired && (
        <Alert severity="error" role="alert">
          {t("signin.failed.body")}
        </Alert>
      )}
      <Box component="section" sx={card} aria-labelledby="profile-contact">
        <Typography id="profile-contact" variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
          {t("profile.contact")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("profile.contact.sub")}
        </Typography>
        <Box sx={grid}>
          <Field
            id="p-given"
            name="givenName"
            label={t("profile.firstName")}
            defaultValue={initial.givenName}
            error={error("givenName")}
            autoComplete="given-name"
          />
          <Field
            id="p-family"
            name="familyName"
            label={t("profile.lastName")}
            defaultValue={initial.familyName}
            error={error("familyName")}
            autoComplete="family-name"
          />
          <Field
            id="p-email"
            name="email"
            type="email"
            label={t("profile.email")}
            defaultValue={initial.email}
            error={error("email")}
            autoComplete="email"
          />
          <Field
            id="p-tel"
            name="telephone"
            type="tel"
            label={t("profile.telephone")}
            defaultValue={initial.telephone}
            error={error("telephone")}
            autoComplete="tel"
          />
        </Box>
      </Box>
      <Box component="section" sx={card} aria-labelledby="profile-address">
        <Typography id="profile-address" variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
          {t("profile.address")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("profile.address.sub")}
        </Typography>
        <Box sx={grid}>
          <Field
            id="p-street1"
            name="street1"
            label={t("profile.street1")}
            defaultValue={initial.street1}
            error={error("street1")}
            full
            autoComplete="address-line1"
          />
          <Field
            id="p-street2"
            name="street2"
            label={t("profile.street2")}
            note={t("profile.optional")}
            defaultValue={initial.street2}
            full
            autoComplete="address-line2"
          />
          <Field
            id="p-city"
            name="city"
            label={t("profile.city")}
            defaultValue={initial.city}
            error={error("city")}
            autoComplete="address-level2"
          />
          <Field
            id="p-state"
            name="state"
            label={t("profile.state")}
            defaultValue={initial.state}
            error={error("state")}
            autoComplete="address-level1"
          />
          <Field
            id="p-zip"
            name="zip"
            label={t("profile.zip")}
            defaultValue={initial.zip}
            error={error("zip")}
            autoComplete="postal-code"
          />
          <SelectField
            id="p-country"
            name="country"
            label={t("profile.country")}
            options={COUNTRIES}
            defaultValue={initial.country || "US"}
            error={error("country")}
          />
        </Box>
      </Box>
      <Box component="section" sx={card} aria-labelledby="profile-card">
        <Typography id="profile-card" variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
          {t("profile.card")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("profile.card.sub")}
        </Typography>
        <Box sx={grid}>
          <SelectField
            id="p-card-type"
            name="cardType"
            label={t("profile.cardType")}
            options={CARD_TYPES}
            defaultValue={initial.cardType || "VISA"}
          />
          <Field
            id="p-card-number"
            name="cardNumber"
            label={t("profile.cardNumber")}
            hint={
              initial.cardLast4 ? t("profile.cardSaved", { last: initial.cardLast4 }) : undefined
            }
            autoComplete="cc-number"
            inputProps={{ inputMode: "numeric" }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <SelectField
              id="p-exp-month"
              name="expiryMonth"
              label={t("profile.expiryMonth")}
              options={MONTHS}
              defaultValue={initial.expiryMonth || "01"}
            />
            <SelectField
              id="p-exp-year"
              name="expiryYear"
              label={t("profile.expiryYear")}
              options={years}
              defaultValue={initial.expiryYear || String(year)}
            />
          </Box>
        </Box>
      </Box>
      <Box component="section" sx={card} aria-labelledby="profile-prefs">
        <Typography id="profile-prefs" variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
          {t("profile.prefs")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("profile.prefs.sub")}
        </Typography>
        <Box sx={grid}>
          <SelectField
            id="p-language"
            name="language"
            label={t("profile.language")}
            options={languages}
            defaultValue={initial.language}
            error={error("language")}
          />
          <SelectField
            id="p-favorite"
            name="favoriteCategory"
            label={t("profile.favorite")}
            options={[{ value: "", label: t("profile.favorite.none") }, ...categories]}
            defaultValue={initial.favoriteCategory}
          />
          <FormControlLabel
            sx={{ gridColumn: "1 / -1", alignItems: "flex-start", m: 0 }}
            control={<Switch name="myList" defaultChecked={initial.myList} />}
            label={
              <Box>
                <Typography sx={{ fontWeight: 500 }}>{t("profile.myList")}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("profile.myList.hint")}
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            sx={{ gridColumn: "1 / -1", alignItems: "flex-start", m: 0 }}
            control={<Switch name="banner" defaultChecked={initial.banner} />}
            label={
              <Box>
                <Typography sx={{ fontWeight: 500 }}>{t("profile.banner")}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("profile.banner.hint")}
                </Typography>
              </Box>
            }
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
        <Button component={Link} href="/account/welcome" variant="text">
          {t("profile.cancel")}
        </Button>
        <Button type="submit" variant="contained" disabled={pending} sx={{ minWidth: 140 }}>
          {t("profile.save")}
        </Button>
      </Box>
    </Box>
  );
}
