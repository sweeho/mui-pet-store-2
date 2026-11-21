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
import { IconLanguage, IconMenu } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME } from "@/constants/app";

import { useLocaleContext, useT } from "@/lib/localization/LocaleProvider";
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
  color: theme.palette.text.secondary,
}));

/** The top bar: the menu button on a small screen and the language control. */
export function Header({ toggleMobileSidebar }: { toggleMobileSidebar: () => void }) {
  const t = useT();
  const { chosen } = useLocaleContext();
  const pathname = usePathname();
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
      </ToolbarStyled>
    </AppBarStyled>
  );
}
