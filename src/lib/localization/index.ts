export type Locale = { language: string; country: string; variant?: string; code: string };

const notImplemented = (): never => {
  throw new Error("VortexNotImplemented");
};

export const DEFAULT_LOCALE = "en_US";
export const resolveLocale = (chosen?: string | null): string =>
  chosen ? notImplemented() : notImplemented();
export const serverDefaultLocale = (): Locale => notImplemented();
export const parseLocaleCode = (code: string | null | undefined): Locale | null =>
  code ? notImplemented() : notImplemented();
export const resolveCatalogLocale = (text: string | null | undefined): Locale | null =>
  text ? notImplemented() : notImplemented();
export const orderEmailLocale = (order: { locale?: string | null }): Locale | null =>
  order ? notImplemented() : notImplemented();
export const formatNumber = (value: number, locale: string, fractionDigits: number): string =>
  value && locale && fractionDigits ? notImplemented() : notImplemented();
export const formatCurrency = (amount: number, locale: string, precision: number): string =>
  amount && locale && precision ? notImplemented() : notImplemented();
export const parseKeywords = (text: string, locale: string): string[] =>
  text && locale ? notImplemented() : notImplemented();
export const createLocalizationRuntime = (opts?: unknown): Promise<never> =>
  opts ? notImplemented() : notImplemented();
