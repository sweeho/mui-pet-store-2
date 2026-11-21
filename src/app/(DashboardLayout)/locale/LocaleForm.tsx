"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { useT } from "@/lib/localization/LocaleProvider";
import { withBasePath } from "@/lib/paths";

export type LocaleChoice = {
  code: string;
  label: string;
  englishName: string;
  translated: boolean;
};

/**
 * The language choices as one radio group. A plain HTML POST to /api/locale, so it works without
 * JavaScript. A radio's name is the native and English names; the code and the not-translated
 * note are its description.
 */
export function LocaleForm({
  locales,
  current,
  from,
}: {
  locales: LocaleChoice[];
  current: string;
  from: string;
}) {
  const t = useT();
  const [selected, setSelected] = useState(current);
  const currentLabel = locales.find((l) => l.code === current)?.label ?? current;
  return (
    <Card
      variant="outlined"
      component="form"
      method="post"
      action={withBasePath("/api/locale")}
      aria-labelledby="locale-group"
      sx={{ maxWidth: 640 }}
    >
      <input type="hidden" name="from" value={from} />
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography
          id="locale-group"
          component="span"
          sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}
        >
          {t("locale.title")}
        </Typography>
      </Box>
      <Box
        component="ul"
        role="radiogroup"
        aria-labelledby="locale-group"
        sx={{ listStyle: "none", m: 0, p: 0 }}
      >
        {locales.map((l, index) => (
          <li key={l.code}>
            <Box
              component="label"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minHeight: 56,
                px: 2,
                py: 1,
                cursor: "pointer",
                borderTop: index === 0 ? 0 : 1,
                borderColor: "divider",
                "&:hover": { boxShadow: (th) => `inset 3px 0 0 ${th.palette.primary.main}` },
                "&:has(input:checked)": { bgcolor: "primary.light" },
              }}
            >
              <Radio
                name="locale"
                value={l.code}
                checked={selected === l.code}
                onChange={() => setSelected(l.code)}
                size="small"
                sx={{ p: 0 }}
                slotProps={{
                  input: {
                    "aria-labelledby": `label-${l.code} english-${l.code}`,
                    "aria-describedby": l.translated
                      ? `code-${l.code}`
                      : `code-${l.code} note-${l.code}`,
                  },
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography id={`label-${l.code}`} component="span" sx={{ fontWeight: 500 }}>
                  {l.label}
                </Typography>
                {l.code === current && (
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ fontSize: "0.75rem", fontWeight: 500, ml: 1 }}
                  >
                    {t("locale.current")}
                  </Typography>
                )}
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ display: "block", fontSize: "0.75rem" }}
                >
                  <span id={`english-${l.code}`}>{l.englishName}</span>
                  {!l.translated && (
                    <span id={`note-${l.code}`}> · {t("locale.notTranslated")}</span>
                  )}
                </Typography>
              </Box>
              <Typography
                id={`code-${l.code}`}
                component="span"
                color="text.secondary"
                sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}
              >
                {l.code}
              </Typography>
            </Box>
          </li>
        ))}
      </Box>
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "secondary.light",
        }}
      >
        <Typography color="text.secondary" sx={{ flex: 1, fontSize: "0.75rem" }}>
          {t("locale.currently", { name: currentLabel })}
        </Typography>
        <Button type="submit" variant="contained">
          {t("locale.submit")}
        </Button>
      </Box>
    </Card>
  );
}
