"use client";

import { ResourceView } from "@/components/StateFrames/ResourceView";
import { useT } from "@/lib/localization/LocaleProvider";
import type { SupportedLocale } from "@/lib/locales";

import { LocaleForm } from "./LocaleForm";

/** The language choices, loaded from GET /api/locales. */
export function LocaleChoices({ current, from }: { current: string; from: string }) {
  const t = useT();
  return (
    <ResourceView<SupportedLocale>
      path="/api/locales"
      emptyTitle={t("locale.empty")}
      errorTitle={t("locale.loadError")}
    >
      {(locales) => <LocaleForm locales={locales} current={current} from={from} />}
    </ResourceView>
  );
}
