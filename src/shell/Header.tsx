/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout/header/Header.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { IconLanguage, IconLogin, IconLogout, IconMenu, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { APP_NAME } from "@/constants/app";

import { useLocaleContext, useT } from "@/lib/localization/LocaleProvider";
import { withBasePath } from "@/lib/paths";
import { findSupportedLocale } from "@/lib/locales";

import { BrandLogo } from "./BrandLogo";

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  justifyContent: "center",
  backdropFilter: "blur(4px)",
  [theme.breakpoints.up("lg")]: {
    minHeight: "64px",
  },
}));

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: "100%",
  flexWrap: "wrap",
  color: theme.palette.text.secondary,
}));

/** The top bar: the menu button on a small screen and the language control. */
export function Header({
  toggleMobileSidebar,
  userName,
  signOffAction,
}: {
  toggleMobileSidebar: () => void;
  /** The signed-on customer: shown with a "Sign off" button. Signed off, a "Sign in" link. */
  userName?: string;
  signOffAction?: () => Promise<void>;
}) {
  const t = useT();
  const { chosen } = useLocaleContext();
  const pathname = usePathname();
  // On the results page the box holds the keywords that were searched.
  const searched = useSearchParams();
  const query = pathname.startsWith("/catalog/search") ? (searched.get("q") ?? "") : "";
  const name = findSupportedLocale(chosen)?.label ?? chosen;
  const href = pathname.startsWith("/locale")
    ? "/locale"
    : `/locale?from=${encodeURIComponent(pathname)}`;
  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label={t("menu.open")}
          onClick={toggleMobileSidebar}
          sx={{
            display: { lg: "none", xs: "inline-flex" },
            width: { xs: 44, lg: 36 },
            height: { xs: 44, lg: 36 },
            fontSize: "0.875rem",
            fontFamily: "inherit",
            color: "text.primary",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>
        <Box
          component={Link}
          href="/"
          sx={{
            display: { xs: "flex", lg: "none" },
            alignItems: "center",
            gap: 1,
            ml: 1,
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "text.primary",
          }}
        >
          <BrandLogo />
          {APP_NAME}
        </Box>
        <Box
          component="form"
          role="search"
          action={withBasePath("/catalog/search")}
          method="get"
          sx={{
            order: { xs: 3, lg: 0 },
            flex: { xs: "1 0 100%", lg: "0 1 420px" },
            height: 36,
            mb: { xs: 1, lg: 0 },
            ml: { lg: 1 },
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            color: "text.secondary",
            "&:focus-within": { borderColor: "primary.main" },
          }}
        >
          <IconButton
            type="submit"
            size="small"
            aria-label={t("header.search")}
            sx={{ p: 0, color: "inherit" }}
          >
            <IconSearch size={18} stroke={1.7} aria-hidden />
          </IconButton>
          <Box
            component="input"
            type="search"
            name="q"
            key={query}
            defaultValue={query}
            aria-label={t("header.search")}
            placeholder={t("header.search.placeholder")}
            sx={{
              border: 0,
              outline: 0,
              flex: 1,
              minWidth: 0,
              font: "inherit",
              color: "text.primary",
              bgcolor: "transparent",
            }}
          />
        </Box>
        <Box flexGrow={1} />
        <Button
          component={Link}
          href={href}
          color="inherit"
          aria-label={t("header.language", { name })}
          startIcon={<IconLanguage size={16} stroke={1.8} aria-hidden />}
          sx={{ color: "text.primary", fontWeight: 500 }}
        >
          {name}
        </Button>
        {userName && signOffAction ? (
          <Box
            component="form"
            action={signOffAction}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box component="span" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
              {userName}
            </Box>
            <Button
              type="submit"
              color="inherit"
              startIcon={<IconLogout size={16} stroke={1.8} aria-hidden />}
              sx={{ color: "text.primary", fontWeight: 500 }}
            >
              {t("header.signoff")}
            </Button>
          </Box>
        ) : (
          <Button
            component={Link}
            href="/signin"
            color="inherit"
            startIcon={<IconLogin size={16} stroke={1.8} aria-hidden />}
            sx={{ color: "text.primary", fontWeight: 500 }}
          >
            {t("header.signin")}
          </Button>
        )}
      </ToolbarStyled>
    </AppBarStyled>
  );
}
