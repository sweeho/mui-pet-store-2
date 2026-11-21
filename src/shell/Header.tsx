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
import { IconMenu } from "@tabler/icons-react";
import Link from "next/link";

import { APP_NAME } from "@/constants/app";

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

/** The top bar: the menu button that opens the sidebar on a small screen. */
export function Header({ toggleMobileSidebar }: { toggleMobileSidebar: () => void }) {
  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="Open the menu"
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
      </ToolbarStyled>
    </AppBarStyled>
  );
}
