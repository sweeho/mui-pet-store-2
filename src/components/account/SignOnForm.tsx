"use client";

import { MONO } from "@/components/catalog/mono";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useActionState } from "react";

import { useT } from "@/lib/localization/LocaleProvider";

import { Field } from "./Field";
import { StatusCard } from "./StatusCard";
import { signOnAction, type SignOnState } from "./actions";

const card = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  p: 3,
  display: "flex",
  flexDirection: "column",
  gap: 2,
} as const;

/**
 * The sign-on screen: the form beside the way to sign up. When sign-on is needed for the page that
 * was asked for, or a sign-on failed, it opens with the sign-in failure panel (SIGN_IN_ERROR).
 */
export function SignOnScreen({
  from,
  failed,
  rememberedName,
  action = signOnAction,
}: {
  /** The page to return to after sign-on. */
  from: string;
  /** Sign-on was needed for the requested page. */
  failed?: boolean;
  /** The user name held in the bp_signon cookie, if any. */
  rememberedName?: string;
  action?: (previous: SignOnState, data: FormData) => Promise<SignOnState>;
}) {
  const t = useT();
  const [state, submit, pending] = useActionState<SignOnState, FormData>(action, {});
  const showError = failed || Boolean(state.error);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {showError ? (
        <StatusCard
          tone="error"
          alert
          icon={<IconAlertTriangle size={28} />}
          title={t("signin.failed.title")}
        >
          <Typography color="text.secondary">
            {state.error === "locked" ? t("signin.locked") : t("signin.failed.body")}
          </Typography>
          <Alert
            severity="info"
            role="note"
            icon={<IconInfoCircle size={18} />}
            sx={{ textAlign: "left" }}
          >
            {t("signin.failed.hint")}
          </Alert>
        </StatusCard>
      ) : (
        <Box>
          <Typography variant="h1">{t("signin.title")}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {t("signin.intro")}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          maxWidth: 920,
          alignItems: "start",
        }}
      >
        <Box component="section" sx={card} aria-labelledby="signin-existing">
          <Box>
            <Typography id="signin-existing" variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
              {t("signin.existing")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("signin.existing.sub")}
            </Typography>
          </Box>
          <Box
            component="form"
            action={submit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <input type="hidden" name="from" value={from} />
            <Field
              id="signin-user"
              name="userName"
              label={t("signin.userName")}
              defaultValue={state.userName ?? rememberedName ?? ""}
              autoComplete="username"
              inputProps={{ maxLength: 50 }}
              sx={{ fontFamily: MONO }}
            />
            <Field
              id="signin-password"
              name="password"
              type="password"
              label={t("signin.concealed")}
              autoComplete="current-password"
              inputProps={{ maxLength: 50 }}
            />
            <FormControlLabel
              control={<Checkbox name="remember" defaultChecked={Boolean(rememberedName)} />}
              label={t("signin.remember")}
            />
            <Button type="submit" variant="contained" disabled={pending}>
              {t("signin.submit")}
            </Button>
          </Box>
        </Box>
        <Box component="section" sx={card} aria-labelledby="signin-new">
          <Box>
            <Typography id="signin-new" variant="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
              {t("signin.new")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("signin.new.sub")}
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/signup"
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          >
            {t("signin.signup")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
