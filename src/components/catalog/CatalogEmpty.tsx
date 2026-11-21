"use client";

import { IconCategory } from "@tabler/icons-react";
import Button from "@mui/material/Button";
import Link from "next/link";

import { EmptyState } from "@/components/StateFrames/EmptyState";
import { useT } from "@/lib/localization/LocaleProvider";

/** The shared empty frame with a way back to the catalog. */
export function CatalogEmpty({ title, description }: { title: string; description: string }) {
  const t = useT();
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button
          component={Link}
          href="/catalog"
          variant="contained"
          sx={{ width: { xs: "100%", sm: "auto" }, height: { xs: 44, sm: 36 } }}
          startIcon={<IconCategory size={16} aria-hidden />}
        >
          {t("catalog.browse")}
        </Button>
      }
    />
  );
}
