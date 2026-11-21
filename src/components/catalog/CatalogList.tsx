"use client";

import { IconChevronRight } from "@tabler/icons-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { CatalogIcon } from "./CatalogIcon";
import { MONO } from "./mono";

export type CatalogRow = {
  href: string;
  title: string;
  description?: string | null;
  code?: string;
  /** Shown after the code on a wide screen only, e.g. the category of a search result. */
  codeExtra?: string;
  price?: string;
  categoryId: string;
};

/** One linked row per entry: picture, title, text, code and price. */
export function CatalogList({ rows }: { rows: CatalogRow[] }) {
  return (
    <Box
      component="ul"
      sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      {rows.map((row) => (
        <Box component="li" key={row.href}>
          <Card
            variant="outlined"
            sx={{ "&:hover": { boxShadow: "0 4px 12px rgba(15,23,42,.08)" } }}
          >
            <CardActionArea
              component={Link}
              href={row.href}
              sx={{
                p: { xs: 1.5, sm: 2 },
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: { xs: 64, sm: 96 },
                  height: { xs: 56, sm: 72 },
                  flex: "none",
                  borderRadius: 1,
                  bgcolor: "primary.light",
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CatalogIcon categoryId={row.categoryId} size={36} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="h2" variant="h3" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                  {row.title}
                </Typography>
                {row.description ? (
                  <Typography
                    color="text.secondary"
                    sx={{ display: row.price ? { xs: "none", sm: "block" } : "block" }}
                  >
                    {row.description}
                  </Typography>
                ) : null}
                {row.code ? (
                  <Typography
                    component="span"
                    color="text.secondary"
                    sx={{ fontFamily: MONO, fontSize: "0.75rem", fontWeight: 500 }}
                  >
                    {row.code}
                    {row.codeExtra ? (
                      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                        {row.codeExtra}
                      </Box>
                    ) : null}
                  </Typography>
                ) : null}
              </Box>
              {row.price ? (
                <Typography
                  component="span"
                  sx={{
                    fontFamily: MONO,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 500,
                  }}
                >
                  {row.price}
                </Typography>
              ) : null}
              <Box component="span" aria-hidden sx={{ color: "text.secondary", display: "flex" }}>
                <IconChevronRight size={18} stroke={1.7} />
              </Box>
            </CardActionArea>
          </Card>
        </Box>
      ))}
    </Box>
  );
}
