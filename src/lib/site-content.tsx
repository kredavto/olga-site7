"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import registry from "@/content/site-content.json";
import { supabase } from "./supabase";

/**
 * Тексты и цифры сайта, которые администратор меняет через Telegram-бота.
 * Значения из site-content.json — запасные: сайт показывает их, пока база
 * не ответила или если она недоступна, поэтому страница никогда не пустеет.
 */
const DEFAULTS: Record<string, string> = Object.fromEntries(
  (registry as { key: string; value: string }[]).map((item) => [item.key, item.value]),
);

const ContentContext = createContext<Record<string, string>>(DEFAULTS);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("key, value")
      .then(({ data, error }) => {
        if (cancelled || error || !data?.length) return;
        const fromDb: Record<string, string> = {};
        for (const row of data) {
          // пустые значения не затирают текст по умолчанию
          if (row.value?.trim()) fromDb[row.key] = row.value;
        }
        setContent((prev) => ({ ...prev, ...fromDb }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

/** Текущее значение по ключу из site-content.json. */
export function useText(key: string): string {
  const content = useContext(ContentContext);
  return content[key] ?? DEFAULTS[key] ?? "";
}

/** Доступ сразу ко всем значениям — для списков (карточки, вопросы). */
export function useContent() {
  return useContext(ContentContext);
}
