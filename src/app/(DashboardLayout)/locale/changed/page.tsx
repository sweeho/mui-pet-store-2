import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { IconArrowLeft, IconInfoCircle, IconLanguage } from "@tabler/icons-react";
import Link from "next/link";

import { formatCurrency, formatNumber } from "@/lib/localization/locale";
import { getMessages, translate, type MessageKey } from "@/lib/localization/messages";
import { getLocaleContext } from "@/lib/localization/request";
import { findSupportedLocale } from "@/lib/locales";
import { safeFrom } from "@/lib/problem";
import { MENU_ITEMS } from "@/shell/SidebarItems";

/** The confirmation after a language change, with a way back. */
export default async function LocaleChangedPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { chosen, locale } = await getLocaleContext();
  const m = getMessages(locale);
  const from = safeFrom((await searchParams).from);
  const entry = findSupportedLocale(chosen);
  const name = entry?.label ?? chosen;
  const menu = MENU_ITEMS.find((i) => i.href === from);
  const returning = menu ? m[menu.titleKey] : from;
  const styleKey = `style.${chosen}` as MessageKey;
  const style = entry ? m[styleKey] : "";
  return (
    <Box data-screen="locale-changed">
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              height: 22,
              px: 1,
              mb: 1,
              borderRadius: 999,
              bgcolor: "success.light",
              color: "success.main",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
            {m["changed.badge"]}
          </Box>
          <Typography variant="h1">{translate(m, "changed.title", { name })}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {translate(m, "changed.description", { english: entry?.englishName ?? chosen })}
          </Typography>
        </Box>
        <Button
          component={Link}
          href={from}
          variant="contained"
          startIcon={<IconArrowLeft size={16} />}
        >
          {m["changed.back"]}
        </Button>
      </Box>
      <Card variant="outlined" component="section" sx={{ p: 2, maxWidth: 640 }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", mb: 1.5 }}>
          {m["changed.settings"]}
        </Typography>
        <Box
          component="dl"
          sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 24px", m: 0 }}
        >
          <Typography component="dt" color="text.secondary">
            {m["changed.language"]}
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {name}{" "}
            <Typography
              component="span"
              color="text.secondary"
              sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}
            >
              {chosen}
            </Typography>
          </Typography>
          <Typography component="dt" color="text.secondary">
            {m["changed.returning"]}
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {returning}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            alignItems: "flex-start",
            mt: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: "action.hover",
            fontSize: "0.8125rem",
          }}
        >
          <Box sx={{ color: "info.main", display: "flex", mt: "1px" }}>
            <IconInfoCircle size={18} stroke={1.8} aria-hidden />
          </Box>
          <span>
            <b style={{ fontWeight: 600 }}>{m["changed.currency"]}</b> {style}
            {" — "}
            <code>{formatCurrency(1234.5, chosen, 2)}</code>. {m["changed.numbers"]}{" "}
            <code>{formatNumber(1234.5, chosen, 1)}</code>.
          </span>
        </Box>
        <Box sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Button
            component={Link}
            href={`/locale?from=${encodeURIComponent(from)}`}
            startIcon={<IconLanguage size={16} />}
            sx={{ pl: 0 }}
          >
            {m["changed.other"]}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
