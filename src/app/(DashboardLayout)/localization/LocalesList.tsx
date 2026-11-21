"use client";

import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { ResourceView } from "@/components/StateFrames/ResourceView";
import type { SupportedLocale } from "@/lib/locales";

/** The supported languages, loaded from GET /api/locales. */
export function LocalesList() {
  return (
    <ResourceView<SupportedLocale>
      path="/api/locales"
      emptyTitle="No languages available"
      emptyDescription="Supported languages will show up here."
      errorTitle="We couldn't load the languages"
    >
      {(items) => (
        <Card variant="outlined">
          <List aria-label="Supported languages">
            {items.map((l) => (
              <ListItem key={l.code} divider>
                <ListItemText primary={l.label} secondary={l.code} />
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </ResourceView>
  );
}
