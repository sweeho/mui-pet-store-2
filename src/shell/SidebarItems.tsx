/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout/sidebar/SidebarItems.tsx and MenuItems.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import {
  IconCategory,
  IconClipboardList,
  IconLanguage,
  IconLayoutDashboard,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME } from "@/constants/app";
import { useT } from "@/lib/localization/LocaleProvider";
import type { MessageKey } from "@/lib/localization/messages";

import { BrandLogo } from "./BrandLogo";

export type MenuGroup = "shop" | "account" | "admin";

/** The sidebar's menu, in groups. Add a page by adding an entry. */
export const MENU_ITEMS = [
  {
    id: "home",
    group: "shop",
    href: "/",
    icon: IconLayoutDashboard,
    titleKey: "menu.home",
    descriptionKey: "menu.home.description",
  },
  {
    id: "catalog",
    group: "shop",
    href: "/catalog",
    icon: IconCategory,
    titleKey: "menu.catalog",
    descriptionKey: "menu.catalog.description",
  },
  {
    id: "search",
    group: "shop",
    href: "/catalog/search",
    icon: IconSearch,
    titleKey: "menu.search",
    descriptionKey: "menu.search.description",
  },
  {
    id: "language",
    group: "account",
    href: "/locale",
    icon: IconLanguage,
    titleKey: "menu.language",
    descriptionKey: "menu.language.description",
  },
  {
    id: "profile",
    group: "account",
    href: "/account/profile",
    icon: IconUser,
    titleKey: "menu.profile",
    descriptionKey: "menu.profile.description",
  },
  {
    id: "orders",
    group: "admin",
    href: "/admin/orders",
    icon: IconClipboardList,
    titleKey: "menu.orders",
    descriptionKey: "menu.orders.description",
  },
] as const satisfies readonly {
  id: string;
  group: MenuGroup;
  href: string;
  icon: unknown;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
}[];

const GROUPS: { id: MenuGroup; titleKey: MessageKey }[] = [
  { id: "shop", titleKey: "menu.shop" },
  { id: "account", titleKey: "menu.account" },
  { id: "admin", titleKey: "menu.admin" },
];

/** The current item: "/" only on the landing page, any other by prefix. */
const isCurrent = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  // The approved mockups mark Catalog as current on every catalog page, search results included.
  if (href === "/catalog/search") return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function SidebarItems() {
  const pathname = usePathname();
  const t = useT();
  return (
    <Box sx={{ px: 1.5 }}>
      <Box sx={{ height: "64px", display: "flex", alignItems: "center" }}>
        <Typography
          component={Link}
          href="/"
          variant="h4"
          color="text.primary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1,
            width: "100%",
            height: "100%",
          }}
        >
          <BrandLogo />
          {APP_NAME}
        </Typography>
      </Box>
      <List component="nav">
        {GROUPS.map((group) => (
          <Box key={group.id}>
            <ListSubheader
              component="div"
              disableSticky
              sx={{
                px: 1,
                pt: 2,
                pb: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
                lineHeight: 1.45,
                color: "text.secondary",
              }}
            >
              {t(group.titleKey)}
            </ListSubheader>
            <List disablePadding>
              {MENU_ITEMS.filter((item) => item.group === group.id).map((item) => (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={isCurrent(pathname, item.href)}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  sx={{
                    borderRadius: 1,
                    mb: 0.25,
                    height: 36,
                    "&.Mui-selected, &.Mui-selected:hover": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: 500,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <item.icon stroke={1.5} size="1.3rem" />
                  </ListItemIcon>
                  <ListItemText primary={t(item.titleKey)} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </List>
    </Box>
  );
}
