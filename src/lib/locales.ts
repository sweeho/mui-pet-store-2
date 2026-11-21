export type SupportedLocale = { code: string; label: string };

/** The languages the store supports. A constant list: no database, no personal data. */
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: "en-US", label: "English (US)" },
  { code: "ja-JP", label: "日本語" },
  { code: "zh-CN", label: "中文" },
];
