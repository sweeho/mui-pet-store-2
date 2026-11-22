import { MONO } from "@/components/catalog/mono";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconAlertTriangle, IconUserOff } from "@tabler/icons-react";

import { LinkButton } from "@/app/(DashboardLayout)/locale/LinkButton";
import { StatusCard } from "@/components/account/StatusCard";
import { SIGN_UP_USER_NAME_MAX } from "@/lib/customer-accounts";
import { getMessages } from "@/lib/localization/messages";
import { getRequestLocale } from "@/lib/localization/request";

/**
 * Where every refused sign-up lands (R-0081). A taken user name shows the "already taken" content
 * (reason=duplicate); any other refusal says the account was not created and why.
 */
export default async function UserCreationErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; name?: string }>;
}) {
  const { reason, name } = await searchParams;
  const m = getMessages(await getRequestLocale());
  if (reason === "duplicate") {
    return (
      <StatusCard
        tone="warning"
        alert
        icon={<IconUserOff size={28} />}
        title={m["error.dup.title"]}
        actions={
          <>
            <LinkButton href="/signup" variant="contained">
              {m["error.dup.again"]}
            </LinkButton>
            <LinkButton href="/signin" variant="outlined">
              {m["error.dup.signin"]}
            </LinkButton>
          </>
        }
      >
        <Typography color="text.secondary">{m["error.dup.body"]}</Typography>
        {name && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              width: "100%",
              bgcolor: "background.default",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              px: 2,
              py: 1.25,
              textAlign: "left",
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" component="div">
                {m["signin.userName"]}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontWeight: 500 }}>{name}</Typography>
            </Box>
            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
              {m["error.dup.badge"]}
            </Typography>
          </Box>
        )}
      </StatusCard>
    );
  }
  return (
    <StatusCard
      tone="error"
      alert
      icon={<IconAlertTriangle size={28} />}
      title={m["error.create.title"]}
      actions={
        <>
          <LinkButton href="/signup" variant="contained">
            {m["error.create.again"]}
          </LinkButton>
          <LinkButton href="/" variant="text">
            {m["error.home"]}
          </LinkButton>
        </>
      }
    >
      <Typography color="text.secondary">{m["error.create.body"]}</Typography>
      <Box
        component="ul"
        sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 1, textAlign: "left" }}
      >
        <Alert
          component="li"
          role="listitem"
          severity={name && name.length > SIGN_UP_USER_NAME_MAX ? "error" : "info"}
        >
          {m["error.create.name"]}
        </Alert>
        <Alert component="li" role="listitem" severity="info">
          {m["error.create.password"]}
        </Alert>
      </Box>
    </StatusCard>
  );
}
