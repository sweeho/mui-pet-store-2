export type Locale = { language: string; country: string; variant?: string; code: string };

/** The locale a visitor has until they choose another. */
export const DEFAULT_LOCALE = "en_US";

/** The server default. A fixed model, not the host's OS locale, so it is the same on every machine. */
export function serverDefaultLocale(): Locale {
  return { language: "en", country: "US", code: DEFAULT_LOCALE };
}

/** The chosen code, or the default when none was chosen. */
export function resolveLocale(chosen?: string | null): string {
  return chosen ? chosen : DEFAULT_LOCALE;
}

/**
 * Parse `language_COUNTRY[_variant]`. "default" (any case) is the server default. Null, empty,
 * or text without an underscore is invalid (null). One parser serves session, catalog and orders.
 */
export function parseLocaleCode(code: string | null | undefined): Locale | null {
  if (!code) return null;
  if (code.toLowerCase() === "default") return serverDefaultLocale();
  const match = /^([A-Za-z]{2,3})_([A-Za-z]{2})(?:_([A-Za-z0-9_]+))?$/.exec(code);
  if (!match) return null;
  const language = match[1].toLowerCase();
  const country = match[2].toUpperCase();
  const variant = match[3];
  const base = `${language}_${country}`;
  return variant
    ? { language, country, variant, code: `${base}_${variant}` }
    : { language, country, code: base };
}

/** A catalog locale text, e.g. "ja_JP". */
export const resolveCatalogLocale = parseLocaleCode;

/** The locale an order's locale string names. */
export function orderEmailLocale(order: { locale?: string | null }): Locale | null {
  return parseLocaleCode(order.locale);
}

/** The BCP-47 tag for Intl and <html lang>: "ja_JP" gives "ja-JP". */
export function toBcp47(code: string): string {
  const locale = parseLocaleCode(code) ?? serverDefaultLocale();
  return `${locale.language}-${locale.country}`;
}

const CURRENCY_BY_COUNTRY: Record<string, string> = { US: "USD", JP: "JPY", CN: "CNY", DE: "EUR" };

/** Numbers in the locale's style with exactly `fractionDigits` fraction digits. */
export function formatNumber(value: number, locale: string, fractionDigits: number): string {
  return new Intl.NumberFormat(toBcp47(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** The locale's own currency, exactly `precision` fraction digits. Prices are stored per locale, so nothing is converted. */
export function formatCurrency(amount: number, locale: string, precision: number): string {
  const country = parseLocaleCode(locale)?.country ?? "US";
  return new Intl.NumberFormat(toBcp47(locale), {
    style: "currency",
    currency: CURRENCY_BY_COUNTRY[country] ?? "USD",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(amount);
}

/** Split text into words by the locale's word-break rules. Bad input gives []. */
export function parseKeywords(text: string, locale: string): string[] {
  try {
    const segmenter = new Intl.Segmenter(toBcp47(locale), { granularity: "word" });
    return [...segmenter.segment(text)].filter((s) => s.isWordLike).map((s) => s.segment);
  } catch {
    return [];
  }
}

/** The request body of an application/x-www-form-urlencoded form, decoded as UTF-8. */
export function parseForm(raw: Buffer): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(raw.toString("utf8")));
}
