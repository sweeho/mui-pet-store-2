export type SupportedLocale = {
  code: string;
  /** The language's own name, e.g. "日本語 (日本)". */
  label: string;
  englishName: string;
  /** False when the store has no text for it and shows US English instead. */
  translated: boolean;
};

/** The languages the store supports (underscore codes). A constant list: no database, no personal data. */
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: "en_US", label: "English (United States)", englishName: "US English", translated: true },
  { code: "de_DE", label: "Deutsch (Deutschland)", englishName: "German", translated: false },
  { code: "ja_JP", label: "日本語 (日本)", englishName: "Japanese", translated: true },
  { code: "zh_CN", label: "简体中文 (中国)", englishName: "Simplified Chinese", translated: true },
];

export const findSupportedLocale = (code: string): SupportedLocale | undefined =>
  SUPPORTED_LOCALES.find((l) => l.code === code);
