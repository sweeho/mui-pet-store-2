"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { useT } from "@/lib/localization/LocaleProvider";

/** The `?start=` link of a page; the first page has none. */
export function pageHref(path: string, params: Record<string, string>, start: number): string {
  const query = new URLSearchParams(params);
  if (start > 0) query.set("start", String(start));
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

/** The range shown ("Categories 1–2") with Previous and Next; one that does not apply is disabled. */
export function Pager({
  label,
  path,
  params = {},
  start,
  size,
  count,
  hasNext,
  hasPrevious,
}: {
  label: string;
  path: string;
  params?: Record<string, string>;
  start: number;
  size: number;
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
}) {
  const t = useT();
  const sx = {
    height: { xs: 44, sm: 36 },
    flex: { xs: 1, sm: "none" },
    px: "14px",
    "& .MuiButton-startIcon": { mr: 1, ml: 0 },
    "& .MuiButton-endIcon": { ml: 1, mr: 0 },
    "&.Mui-disabled": { color: "grey.400" },
  };
  return (
    <Box
      component="nav"
      aria-label={label}
      sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
    >
      <Typography role="status" color="text.secondary" sx={{ fontSize: "0.75rem", mr: "auto" }}>
        <Box
          component="span"
          sx={{
            // Visible beside the range on a wide screen; read out, not shown, on a small one.
            position: { xs: "absolute", sm: "static" },
            width: { xs: "1px", sm: "auto" },
            height: { xs: "1px", sm: "auto" },
            overflow: { xs: "hidden", sm: "visible" },
            clipPath: { xs: "inset(50%)", sm: "none" },
            whiteSpace: "nowrap",
          }}
        >
          {label}{" "}
        </Box>
        {String(start + 1)}–{String(start + count)}
      </Typography>
      {hasPrevious ? (
        <Button
          component={Link}
          href={pageHref(path, params, Math.max(0, start - size))}
          variant="outlined"
          color="inherit"
          startIcon={<IconChevronLeft size={16} aria-hidden />}
          sx={{ ...sx, borderColor: "divider" }}
        >
          {t("catalog.previous")}
        </Button>
      ) : (
        <Button
          disabled
          variant="outlined"
          startIcon={<IconChevronLeft size={16} aria-hidden />}
          sx={sx}
        >
          {t("catalog.previous")}
        </Button>
      )}
      {hasNext ? (
        <Button
          component={Link}
          href={pageHref(path, params, start + size)}
          variant="outlined"
          color="inherit"
          endIcon={<IconChevronRight size={16} aria-hidden />}
          sx={{ ...sx, borderColor: "divider" }}
        >
          {t("catalog.next")}
        </Button>
      ) : (
        <Button
          disabled
          variant="outlined"
          endIcon={<IconChevronRight size={16} aria-hidden />}
          sx={sx}
        >
          {t("catalog.next")}
        </Button>
      )}
    </Box>
  );
}
