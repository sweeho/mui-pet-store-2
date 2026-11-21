"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { useT } from "@/lib/localization/LocaleProvider";

import { CatalogIcon } from "./CatalogIcon";
import { MONO } from "./mono";

export type ItemDetail = {
  id: string;
  title: string;
  description: string;
  price: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  attributes: (string | null)[];
};

const cell = {
  minHeight: 40,
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  borderBottom: 1,
  borderColor: "divider",
  m: 0,
} as const;

/** An item's picture and details. The list price only: unit cost is never shown to shoppers. */
export function ItemDetailView({ item }: { item: ItemDetail }) {
  const t = useT();
  const extra = item.attributes
    .slice(1)
    .flatMap((value, i) => (value ? [{ n: i + 2, value }] : []));
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
        alignItems: "start",
      }}
    >
      <Card variant="outlined" sx={{ p: 2 }}>
        <Box
          aria-hidden
          sx={{
            height: { xs: 220, md: 320 },
            borderRadius: 1,
            bgcolor: "primary.light",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CatalogIcon categoryId={item.categoryId} size={128} />
        </Box>
      </Card>
      <Card variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              height: 22,
              px: 1,
              borderRadius: 999,
              fontSize: "0.75rem",
              fontWeight: 500,
              bgcolor: "primary.light",
              color: "primary.main",
            }}
          >
            {item.categoryName}
          </Box>
          <Typography
            component="span"
            color="text.secondary"
            sx={{ fontFamily: MONO, fontSize: "0.75rem", fontWeight: 500 }}
          >
            {item.id}
          </Typography>
        </Box>
        <Typography component="h2" sx={{ fontSize: "1.25rem", fontWeight: 600, mt: 1 }}>
          {item.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          {item.description}
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          <Typography
            component="span"
            sx={{ fontFamily: MONO, fontSize: "1.5rem", fontWeight: 500 }}
          >
            {item.price}
          </Typography>{" "}
          <Typography component="span" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            {t("catalog.item.each")}
          </Typography>
        </Typography>
        <Typography
          component="h3"
          color="text.secondary"
          sx={{ fontSize: "0.75rem", fontWeight: 600, mt: 3, mb: 1 }}
        >
          {t("catalog.item.details")}
        </Typography>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gridTemplateColumns: { xs: "110px 1fr", sm: "140px 1fr" },
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Box component="dt" sx={{ ...cell, color: "text.secondary", fontSize: "0.75rem" }}>
            {t("catalog.item.product")}
          </Box>
          <Box component="dd" sx={cell}>
            <MuiLink
              component={Link}
              href={`/catalog/products/${item.productId}`}
              underline="hover"
            >
              {item.productName}
            </MuiLink>
            <Typography
              component="span"
              color="text.secondary"
              sx={{ fontFamily: MONO, fontSize: "0.75rem", fontWeight: 500 }}
            >
              {item.productId}
            </Typography>
          </Box>
          <Box component="dt" sx={{ ...cell, color: "text.secondary", fontSize: "0.75rem" }}>
            {t("catalog.item.category")}
          </Box>
          <Box component="dd" sx={cell}>
            <MuiLink
              component={Link}
              href={`/catalog/categories/${item.categoryId}`}
              underline="hover"
            >
              {item.categoryName}
            </MuiLink>
          </Box>
          {item.attributes[0] ? (
            <>
              <Box component="dt" sx={{ ...cell, color: "text.secondary", fontSize: "0.75rem" }}>
                {t("catalog.item.size")}
              </Box>
              <Box component="dd" sx={cell}>
                {item.attributes[0]}
              </Box>
            </>
          ) : null}
          {extra.map((a) => (
            <Box key={a.n} sx={{ display: "contents" }}>
              <Box component="dt" sx={{ ...cell, color: "text.secondary", fontSize: "0.75rem" }}>
                {t("catalog.item.attribute", { n: String(a.n) })}
              </Box>
              <Box component="dd" sx={cell}>
                {a.value}
              </Box>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
