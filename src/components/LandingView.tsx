"use client";

import { IconArrowRight, IconPaw } from "@tabler/icons-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { APP_NAME } from "@/constants/app";
import { useT } from "@/lib/localization/LocaleProvider";
import { MENU_ITEMS } from "@/shell/SidebarItems";

/** The landing page: a welcome and one card per primary area, generated from MENU_ITEMS. */
export function LandingView() {
  const t = useT();
  const areas = MENU_ITEMS.filter((item) => item.href !== "/");
  return (
    <Box data-screen="main" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 4 },
          display: "flex",
          gap: 3,
          alignItems: "center",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light} 0, ${theme.palette.background.paper} 70%)`,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              height: 22,
              px: 1,
              mb: 1.5,
              borderRadius: 999,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }} />
            {t("landing.welcome")}
          </Box>
          <Typography variant="h1" sx={{ fontSize: { xs: "1.625rem", sm: "2rem" } }}>
            {t("landing.title")}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 520, fontSize: "0.9375rem" }}>
            {t("landing.intro", { app: APP_NAME })}
          </Typography>
        </Box>
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", sm: "grid" },
            placeItems: "center",
            width: 200,
            height: 160,
            borderRadius: 1,
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          <IconPaw size={96} stroke={1.2} />
        </Box>
      </Card>
      <Box component="section" aria-labelledby="areas-heading">
        <Typography id="areas-heading" variant="h2" sx={{ mb: 1.5 }}>
          {t("landing.areas")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          }}
        >
          {areas.map((item) => (
            <Card key={item.href} variant="outlined">
              <CardActionArea
                component={Link}
                href={item.href}
                sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "flex-start" }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    flex: "none",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "primary.light",
                    color: "primary.main",
                  }}
                >
                  <item.icon size={20} stroke={1.7} aria-hidden />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography component="span" sx={{ fontWeight: 600, display: "block" }}>
                    {t(item.titleKey)}
                  </Typography>
                  <Typography component="span" color="text.secondary" sx={{ display: "block" }}>
                    {t(item.descriptionKey)}
                  </Typography>
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 500, mt: 1 }}
                  >
                    {t(item.titleKey)}
                    <IconArrowRight size={14} stroke={2} aria-hidden />
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
