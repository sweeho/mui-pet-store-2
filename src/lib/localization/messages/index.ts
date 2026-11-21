import { DEFAULT_LOCALE } from "../locale";
import { en_US, type MessageKey } from "./en_US";
import { ja_JP } from "./ja_JP";
import { zh_CN } from "./zh_CN";

export type { MessageKey };
export type Messages = Record<MessageKey, string>;

const CATALOGS: Record<string, Messages> = { en_US, ja_JP, zh_CN };

/** The locales that have message text. Any other (de_DE) is shown in the default's text. */
export const hasMessages = (code: string): boolean => code in CATALOGS;

export const messageLocale = (code: string): string => (hasMessages(code) ? code : DEFAULT_LOCALE);

export const getMessages = (code: string): Messages => CATALOGS[messageLocale(code)];

/** Look up a key and fill `{name}` placeholders. */
export function translate(
  messages: Messages,
  key: MessageKey,
  vars: Record<string, string> = {},
): string {
  return messages[key].replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? `{${name}}`);
}
