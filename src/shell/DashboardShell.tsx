/*
 * Adapted from Modernize Free (MIT, AdminMart), package/src/app/(DashboardLayout)/layout.tsx, at commit 948e484. See
 * src/shell/LICENSE.md. Trimmed to the layout shell (plan 118 B2).
 */

"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { useState } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

/** The sidebar, the header and the page between them. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <MainWrapper>
      <Sidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper>
        <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <Container sx={{ paddingTop: "20px", maxWidth: "1200px" }}>
          <Box component="main" sx={{ minHeight: "calc(100vh - 170px)" }}>
            {children}
          </Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
}
