"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useActionState } from "react";

import { useT } from "@/lib/localization/LocaleProvider";

import { Field } from "./Field";
import { signUpAction, type SignOnState } from "./actions";

/** Sign up: a user name and a password. A refusal goes to the user creation error page. */
export function SignUpForm() {
  const t = useT();
  const [state, submit, pending] = useActionState<SignOnState, FormData>(signUpAction, {});
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 480 }}>
      <Box>
        <Typography variant="h1">{t("signup.title")}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {t("signup.intro")}
        </Typography>
      </Box>
      <Box
        component="form"
        action={submit}
        noValidate
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {state.error === "locked" && (
          <Typography role="alert" color="error">
            {t("signin.locked")}
          </Typography>
        )}
        <Field
          id="signup-user"
          name="userName"
          label={t("signup.userName")}
          hint={t("signup.userName.hint")}
          defaultValue={state.userName ?? ""}
          autoComplete="username"
        />
        <Field
          id="signup-password"
          name="password"
          type="password"
          label={t("signup.credential")}
          hint={t("signup.credential.hint")}
          autoComplete="new-password"
          inputProps={{ maxLength: 50 }}
        />
        <Button type="submit" variant="contained" disabled={pending}>
          {t("signup.submit")}
        </Button>
        <Button component={Link} href="/signin" variant="text">
          {t("signup.have")}
        </Button>
      </Box>
    </Box>
  );
}
