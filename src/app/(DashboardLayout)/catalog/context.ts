import { getDb } from "@/db/client";
import { DEFAULT_PAGE_SIZE, createCatalog, type ItemRow } from "@/lib/catalog-browsing";
import { formatCurrency } from "@/lib/localization/locale";
import { getMessages, translate, type MessageKey } from "@/lib/localization/messages";
import { getLocaleContext } from "@/lib/localization/request";

/** Entries per page: the catalog default. */
export const PAGE_SIZE = DEFAULT_PAGE_SIZE;

/** What every catalog page needs: the catalog over the app database, the locale and the text. */
export async function getCatalogContext() {
  const { locale } = await getLocaleContext();
  const messages = getMessages(locale);
  return {
    catalog: createCatalog({ db: await getDb() }),
    locale,
    text: (key: MessageKey, vars?: Record<string, string>) => translate(messages, key, vars),
    price: (amount: number) => formatCurrency(amount, locale, 2),
  };
}

/** `?start=`: a whole number of zero or more; anything else is the first page. */
export function parseStart(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(n) && n > 0 ? n : 0;
}

/** An item is named for its product and its first attribute: "Large Angelfish". */
export const itemTitle = (item: Pick<ItemRow, "attr1" | "name">) =>
  [item.attr1, item.name].filter(Boolean).join(" ");
