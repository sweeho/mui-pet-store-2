"use client";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { useT } from "@/lib/localization/LocaleProvider";

export type Crumb = { label: string; href?: string };

/** The trail to the current page; the last crumb has no link and is the current page. */
export function CatalogBreadcrumbs({ trail }: { trail: Crumb[] }) {
  const t = useT();
  return (
    <Breadcrumbs
      component="nav"
      aria-label={t("catalog.breadcrumb")}
      separator="›"
      sx={{
        mb: 1,
        fontSize: "0.75rem",
        "& .MuiBreadcrumbs-separator": { mx: 0.75 },
      }}
    >
      {trail.map((crumb, i) =>
        crumb.href ? (
          <MuiLink
            key={i}
            component={Link}
            href={crumb.href}
            underline="hover"
            color="text.secondary"
          >
            {crumb.label}
          </MuiLink>
        ) : (
          <Typography
            key={i}
            aria-current="page"
            sx={{ fontSize: "inherit", fontWeight: 500, color: "text.primary" }}
          >
            {crumb.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}
