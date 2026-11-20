"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = { id: string; from: "user" | "bot"; text: string };
type ServerMessage = { id: number; sender: "visitor" | "admin"; text: string };

const GREETING =
  "Здравствуйте! Это «ФИНДРАЙВ». Напишите ваш вопрос — специалист ответит в ближайшее время.";
const STORAGE_KEY = "findrive_chat_id";

/** Уникальный идентификатор посетителя — по нему он видит ответы на свои сообщения. */
function getVisitorId(create: boolean) {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id && create) {
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id ?? "";
  } catch {
    return "";
  }
}

const toMessage = (m: ServerMessage): Message => ({
  id: `s${m.id}`,
  from: m.sender === "admin" ? "bot" : "user",
  text: m.text,
});

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", from: "bot", text: GREETING },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(0);
  const historyLoadedRef = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;

  // открытие по кнопке «Чат» в шапке и футере
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("findrive:open-chat", openChat);
    return () => window.removeEventListener("findrive:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (open) setUnread(false);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  /** Подтягиваем ответы администратора (и историю при первом открытии). */
  const poll = useCallback(async () => {
    const visitorId = getVisitorId(false);
    if (!visitorId) return;
    try {
      const { data, error } = await supabase.functions.invoke("chat-poll", {
        body: { visitorId, afterId: lastIdRef.current },
      });
      if (error || !Array.isArray(data?.messages)) return;
      const incoming: ServerMessage[] = data.messages;
      if (!incoming.length) {
        historyLoadedRef.current = true;
        return;
      }
      lastIdRef.current = Math.max(lastIdRef.current, ...incoming.map((m) => m.id));

      if (!historyLoadedRef.current) {
        // первое обращение — восстанавливаем всю переписку
        historyLoadedRef.current = true;
        setMessages([{ id: "greeting", from: "bot", text: GREETING }, ...incoming.map(toMessage)]);
        return;
      }
      // свои сообщения посетитель уже видит — добавляем только ответы
      const replies = incoming.filter((m) => m.sender === "admin").map(toMessage);
      if (replies.length) {
        setMessages((prev) => [...prev, ...replies]);
        if (!openRef.current) setUnread(true);
      }
    } catch {
      // сеть или база недоступны — попробуем при следующем опросе
    }
  }, []);

  // чаще, пока окно открыто; реже — чтобы показать значок нового ответа
  useEffect(() => {
    poll();
    const timer = window.setInterval(poll, open ? 6000 : 45000);
    return () => window.clearInterval(timer);
  }, [open, poll]);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, from: "user", text: value }]);
    setText("");

    try {
      const { data, error } = await supabase.functions.invoke("chat-message", {
        body: { text: value, contact: contact.trim(), visitorId: getVisitorId(true) },
      });
      if (error || !data?.success) throw new Error("send failed");
      // собственное сообщение уже на экране — не дублируем его при опросе
      if (typeof data.id === "number") lastIdRef.current = Math.max(lastIdRef.current, data.id);
      historyLoadedRef.current = true;
      setMessages((prev) => [
        ...prev,
        {
          id: `n${Date.now()}`,
          from: "bot",
          text: "Сообщение получено. Мы ответим вам в ближайшее время.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e${Date.now()}`,
          from: "bot",
          text: "Не удалось отправить сообщение. Позвоните нам: 8 (921) 988-88-80",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* плавающая кнопка */}
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть чат" : "Открыть чат"}
        style={{ position: "fixed" }}
        className="btn-gold glow-pulse bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full p-0 lg:bottom-8 lg:right-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <MessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>
        {unread && !open && (
          <span
            aria-label="Новый ответ"
            className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0b0a07] bg-[#e2564f]"
          />
        )}
      </motion.button>

      {/* окно чата */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong fixed bottom-24 right-3 z-[95] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)] lg:bottom-28 lg:right-8"
            style={{ maxHeight: "min(70vh, 34rem)" }}
          >
            {/* шапка */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e2b64f]/30 bg-[#e2b64f]/10 text-[#e2b64f]">
                <MessageCircle size={18} />
              </span>
              <div className="min-w-0">
                <p className="display text-base leading-tight">Чат с «ФИНДРАЙВ»</p>
                <p className="mt-1 text-sm leading-snug text-[#a5a4a0]">
                  Обычно отвечаем за несколько минут
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть чат"
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#a5a4a0] transition-colors hover:bg-white/5 hover:text-[#f0cd7a]"
              >
                <X size={18} />
              </button>
            </div>

            {/* лента сообщений */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={m.from === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <p
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed ${
                      m.from === "user"
                        ? "bg-gradient-to-br from-[#f0cd7a] to-[#b8892b] text-[#0b0a07]"
                        : "border border-white/10 bg-white/[0.04] text-[#e6e5e1]"
                    }`}
                  >
                    {m.text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* форма ввода */}
            <div className="border-t border-white/10 px-4 py-3 space-y-2">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Телефон или email для ответа"
                className="lux-input h-11 text-[0.95rem]"
                type="text"
              />
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ваше сообщение..."
                  rows={2}
                  className="lux-input h-auto min-h-[3rem] resize-none py-2.5 text-[0.95rem]"
                />
                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  aria-label="Отправить"
                  className="btn-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
