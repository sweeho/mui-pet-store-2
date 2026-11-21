"use client";

import { createContext, useContext } from "react";

import { DEFAULT_LOCALE } from "./locale";
import { getMessages, translate, type MessageKey, type Messages } from "./messages";

type Value = { chosen: string; locale: string; messages: Messages };

const LocaleContext = createContext<Value>({
  chosen: DEFAULT_LOCALE,
  locale: DEFAULT_LOCALE,
  messages: getMessages(DEFAULT_LOCALE),
});

/** Gives client components the request's locale and its messages (set once, in the root layout). */
export function LocaleProvider({
  chosen,
  locale,
  children,
}: {
  chosen: string;
  locale: string;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ chosen, locale, messages: getMessages(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocaleContext = () => useContext(LocaleContext);

/** `t("menu.home")`, `t("header.language", { name })`. */
export function useT() {
  const { messages } = useContext(LocaleContext);
  return (key: MessageKey, vars?: Record<string, string>) => translate(messages, key, vars);
}
