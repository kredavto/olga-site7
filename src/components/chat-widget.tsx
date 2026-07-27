"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = { id: number; from: "user" | "bot"; text: string };

const GREETING =
  "Здравствуйте! Это «ФИНДРАЙВ». Напишите ваш вопрос — специалист ответит в ближайшее время.";

/** Уникальный идентификатор посетителя, чтобы менеджер видел ветку диалога. */
function getVisitorId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("findrive_chat_id");
  if (!id) {
    id = Math.random().toString(36).slice(2, 8).toUpperCase();
    window.localStorage.setItem("findrive_chat_id", id);
  }
  return id;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: GREETING },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  // открытие по кнопке «Чат» в шапке и футере
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("findrive:open-chat", openChat);
    return () => window.removeEventListener("findrive:open-chat", openChat);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text: value }]);
    setText("");

    try {
      const { data, error } = await supabase.functions.invoke("chat-message", {
        body: { text: value, contact: contact.trim(), visitorId: getVisitorId() },
      });
      if (error || !data?.success) throw new Error("send failed");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: "Сообщение получено. Мы ответим вам в ближайшее время.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
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
