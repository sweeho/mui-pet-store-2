/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout/sidebar/Sidebar.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/material/styles";

import { SidebarItems } from "./SidebarItems";

const SIDEBAR_WIDTH = "240px";

const scrollbarStyles = {
  "&::-webkit-scrollbar": { width: "7px" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "divider", borderRadius: "15px" },
};

/** The sidebar: fixed on a large screen, a drawer the header opens on a small one. */
export function Sidebar({
  isMobileSidebarOpen,
  onSidebarClose,
}: {
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
}) {
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));

  if (lgUp) {
    return (
      <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
        <Drawer
          anchor="left"
          open
          variant="permanent"
          slotProps={{
            paper: { sx: { boxSizing: "border-box", width: SIDEBAR_WIDTH, ...scrollbarStyles } },
          }}
        >
          <SidebarItems />
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: { width: SIDEBAR_WIDTH, boxShadow: (theme) => theme.shadows[8], ...scrollbarStyles },
        },
      }}
    >
      <SidebarItems />
    </Drawer>
  );
}
