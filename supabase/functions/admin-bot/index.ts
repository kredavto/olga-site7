// Админ-панель сайта «ФИНДРАЙВ» в Telegram.
// Telegram присылает сюда обновления через webhook. Доступ — только у владельца
// (tg_admin_user_id), а запросы без секрета вебхука отклоняются.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

type Cfg = Record<string, string>;
type Btn = { text: string; callback_data?: string; url?: string };
type Keyboard = Btn[][];

const STATUS: Record<string, string> = {
  new: "🆕 Новая",
  in_work: "⏳ В работе",
  approved: "✅ Одобрена",
  rejected: "❌ Отказ",
};
const KIND: Record<string, string> = {
  borrower: "Заём",
  partner: "Партнёр",
  investor: "Инвестор",
};
const PAGE = 8;
const SITE_NOTE = "Изменение появится на сайте при следующем открытии страницы.";

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

let token = "";
async function tg(method: string, payload: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

/** Новое сообщение или правка текущего (при навигации по кнопкам). */
async function show(chatId: number, text: string, keyboard: Keyboard, editId?: number) {
  const payload = {
    chat_id: chatId,
    text: cut(text, 4000),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: keyboard },
  };
  if (editId) {
    const r = await tg("editMessageText", { ...payload, message_id: editId });
    if (r.ok || String(r.description).includes("not modified")) return;
  }
  await tg("sendMessage", payload);
}

const MENU: Keyboard = [
  [
    { text: "📋 Заявки", callback_data: "leads:all:0" },
    { text: "💬 Чат", callback_data: "chats:0" },
  ],
  [
    { text: "📊 Статистика", callback_data: "stats" },
    { text: "✏️ Тексты и цифры", callback_data: "content" },
  ],
];
const BACK_MENU: Btn = { text: "🏠 Меню", callback_data: "menu" };

async function setState(db: SupabaseClient, state: Record<string, string> | null) {
  if (state) {
    await db.from("private_config").upsert({ key: "admin_state", value: JSON.stringify(state) });
  } else {
    await db.from("private_config").delete().eq("key", "admin_state");
  }
}

/* ------------------------------- Экраны -------------------------------- */

async function menu(chatId: number, editId?: number) {
  await show(chatId, "<b>Админ-панель «ФИНДРАЙВ»</b>\nВыберите раздел:", MENU, editId);
}

async function leadsList(db: SupabaseClient, chatId: number, filter: string, offset: number, editId?: number) {
  let q = db
    .from("leads")
    .select("id, created_at, kind, name, phone, status", { count: "exact" })
    .order("id", { ascending: false })
    .range(offset, offset + PAGE - 1);
  if (filter !== "all") q = q.eq("status", filter);
  const { data, count } = await q;

  const title = filter === "all" ? "Все заявки" : `Заявки: ${STATUS[filter]}`;
  const rows: Keyboard = (data ?? []).map((l) => [
    {
      text: cut(`${STATUS[l.status].split(" ")[0]} №${l.id} · ${l.name} · ${fmtDate(l.created_at)}`, 60),
      callback_data: `lead:${l.id}`,
    },
  ]);
  const nav: Btn[] = [];
  if (offset > 0) nav.push({ text: "◀️", callback_data: `leads:${filter}:${Math.max(0, offset - PAGE)}` });
  if ((count ?? 0) > offset + PAGE) nav.push({ text: "▶️", callback_data: `leads:${filter}:${offset + PAGE}` });
  if (nav.length) rows.push(nav);
  rows.push(
    ["all", "new", "in_work"].map((f) => ({
      text: (f === filter ? "• " : "") + (f === "all" ? "Все" : STATUS[f]),
      callback_data: `leads:${f}:0`,
    })),
    ["approved", "rejected"].map((f) => ({
      text: (f === filter ? "• " : "") + STATUS[f],
      callback_data: `leads:${f}:0`,
    })),
    [BACK_MENU],
  );
  const text = data?.length
    ? `<b>${esc(title)}</b> — всего ${count}.\nНажмите на заявку, чтобы открыть её.`
    : `<b>${esc(title)}</b>\nЗаявок пока нет.`;
  await show(chatId, text, rows, editId);
}

async function leadCard(db: SupabaseClient, chatId: number, id: number, editId?: number) {
  const { data: l } = await db.from("leads").select("*").eq("id", id).single();
  if (!l) return show(chatId, "Заявка не найдена.", [[{ text: "◀️ К заявкам", callback_data: "leads:all:0" }]], editId);

  const files: string[] = l.file_urls ?? [];
  const lines = [
    `<b>Заявка №${l.id}</b> — ${KIND[l.kind] ?? l.kind}`,
    `Статус: <b>${STATUS[l.status]}</b>`,
    `Дата: ${fmtDate(l.created_at)}`,
    "",
    `Имя: ${esc(l.name)}`,
    `Телефон: ${esc(l.phone)}`,
    `Email: ${esc(l.email || "—")}`,
  ];
  if (l.kind !== "partner") lines.push(`Сумма: ${esc(l.amount || "—")}`);
  if (l.kind === "investor") lines.push(`Срок: ${esc(l.term || "—")}`);
  if (l.consents) lines.push(`Согласия: ${esc(l.consents)}`);
  lines.push(`Файлы: ${files.length ? files.length : "нет"}`);

  const kb: Keyboard = [];
  files.slice(0, 10).forEach((url, i) => kb.push([{ text: `📎 Файл ${i + 1}`, url }]));
  kb.push(
    Object.keys(STATUS)
      .filter((s) => s !== l.status)
      .slice(0, 3)
      .map((s) => ({ text: STATUS[s], callback_data: `ls:${l.id}:${s}` })),
  );
  kb.push([{ text: "◀️ К заявкам", callback_data: "leads:all:0" }, BACK_MENU]);
  await show(chatId, lines.join("\n"), kb, editId);
}

async function chatsList(db: SupabaseClient, chatId: number, offset: number, editId?: number) {
  // последние 300 сообщений достаточно, чтобы собрать свежие диалоги
  const { data } = await db
    .from("chat_messages")
    .select("visitor_id, contact, sender, text, created_at")
    .order("id", { ascending: false })
    .limit(300);

  const threads = new Map<string, { last: string; contact: string; waiting: boolean; preview: string }>();
  for (const m of data ?? []) {
    if (!threads.has(m.visitor_id)) {
      threads.set(m.visitor_id, {
        last: m.created_at,
        contact: m.contact ?? "",
        waiting: m.sender === "visitor",
        preview: m.text,
      });
    } else if (!threads.get(m.visitor_id)!.contact && m.contact) {
      threads.get(m.visitor_id)!.contact = m.contact;
    }
  }
  const list = [...threads.entries()];
  const page = list.slice(offset, offset + PAGE);
  const kb: Keyboard = page.map(([visitor, t]) => [
    {
      text: cut(`${t.waiting ? "🔴" : "⚪️"} ${t.contact || "#" + visitor.slice(0, 6)} · ${t.preview}`, 60),
      callback_data: `chat:${visitor}`,
    },
  ]);
  const nav: Btn[] = [];
  if (offset > 0) nav.push({ text: "◀️", callback_data: `chats:${Math.max(0, offset - PAGE)}` });
  if (list.length > offset + PAGE) nav.push({ text: "▶️", callback_data: `chats:${offset + PAGE}` });
  if (nav.length) kb.push(nav);
  kb.push([BACK_MENU]);
  const text = list.length
    ? "<b>Диалоги в чате сайта</b>\n🔴 — ждёт ответа. Нажмите на диалог, чтобы прочитать и ответить."
    : "<b>Диалоги в чате сайта</b>\nСообщений пока нет.";
  await show(chatId, text, kb, editId);
}

async function chatThread(db: SupabaseClient, chatId: number, visitor: string, editId?: number) {
  const { data } = await db
    .from("chat_messages")
    .select("sender, text, contact, created_at")
    .eq("visitor_id", visitor)
    .order("id", { ascending: false })
    .limit(15);
  const msgs = (data ?? []).reverse();
  const contact = msgs.find((m) => m.contact)?.contact;
  const body = msgs
    .map((m) => `${m.sender === "admin" ? "🟡 <b>Вы</b>" : "👤 <b>Посетитель</b>"} · ${fmtDate(m.created_at)}\n${esc(m.text)}`)
    .join("\n\n");
  const text = `<b>Диалог #${esc(visitor.slice(0, 6))}</b>\nКонтакт: ${esc(contact || "не указан")}\n\n${body || "Сообщений нет."}`;
  await show(
    chatId,
    text,
    [
      [{ text: "✍️ Ответить", callback_data: `reply:${visitor}` }],
      [{ text: "◀️ К диалогам", callback_data: "chats:0" }, BACK_MENU],
    ],
    editId,
  );
}

async function stats(db: SupabaseClient, chatId: number, editId?: number) {
  const since = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
  // Москва — UTC+3 без перехода на летнее время
  const MSK = 3 * 3600000;
  const startToday = new Date(Math.floor((Date.now() + MSK) / 86400000) * 86400000 - MSK).toISOString();

  const countLeads = async (from: string, extra?: (q: any) => any) => {
    let q = db.from("leads").select("id", { count: "exact", head: true }).gte("created_at", from);
    if (extra) q = extra(q);
    return (await q).count ?? 0;
  };
  const countChat = async (from: string) =>
    (
      await db
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("sender", "visitor")
        .gte("created_at", from)
    ).count ?? 0;
  const countUsers = async (from: string) => {
    const { data } = await db.rpc("admin_count_users", { since: from });
    return typeof data === "number" ? data : 0;
  };

  const periods: [string, string][] = [
    ["Сегодня", startToday],
    ["7 дней", since(7)],
    ["30 дней", since(30)],
  ];
  const lines = ["<b>Статистика сайта</b>", ""];
  for (const [name, from] of periods) {
    const [leads, chat, users] = await Promise.all([countLeads(from), countChat(from), countUsers(from)]);
    lines.push(`<b>${name}</b>: заявок ${leads} · сообщений в чат ${chat} · регистраций ${users}`);
  }
  const byStatus = await Promise.all(
    Object.keys(STATUS).map(async (s) => {
      const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("status", s);
      return `${STATUS[s]}: ${count ?? 0}`;
    }),
  );
  lines.push("", "<b>Заявки по статусам (за всё время)</b>", ...byStatus);
  await show(chatId, lines.join("\n"), [[{ text: "🔄 Обновить", callback_data: "stats" }, BACK_MENU]], editId);
}

async function contentRoot(chatId: number, editId?: number) {
  await show(
    chatId,
    "<b>Тексты и цифры сайта</b>\nВыберите, что хотите изменить.",
    [
      [
        { text: "🔢 Цифры", callback_data: "cl:numbers:0" },
        { text: "📝 Абзацы и тексты", callback_data: "cl:texts:0" },
      ],
      [BACK_MENU],
    ],
    editId,
  );
}

async function contentList(db: SupabaseClient, chatId: number, grp: string, offset: number, editId?: number) {
  const { data, count } = await db
    .from("site_content")
    .select("key, label", { count: "exact" })
    .eq("grp", grp)
    .order("sort")
    .range(offset, offset + PAGE - 1);
  const kb: Keyboard = (data ?? []).map((c) => [{ text: cut(c.label, 60), callback_data: `ce:${c.key}` }]);
  const nav: Btn[] = [];
  if (offset > 0) nav.push({ text: "◀️", callback_data: `cl:${grp}:${Math.max(0, offset - PAGE)}` });
  if ((count ?? 0) > offset + PAGE) nav.push({ text: "▶️", callback_data: `cl:${grp}:${offset + PAGE}` });
  if (nav.length) kb.push(nav);
  kb.push([{ text: "◀️ Назад", callback_data: "content" }, BACK_MENU]);
  await show(
    chatId,
    `<b>${grp === "numbers" ? "Цифры" : "Абзацы и тексты"}</b> (${count ?? 0})\nВыберите элемент.`,
    kb,
    editId,
  );
}

async function contentItem(db: SupabaseClient, chatId: number, key: string, editId?: number) {
  const { data: c } = await db.from("site_content").select("*").eq("key", key).single();
  if (!c) return show(chatId, "Элемент не найден.", [[BACK_MENU]], editId);
  const changed = c.value !== c.default_value;
  await show(
    chatId,
    `<b>${esc(c.label)}</b>\n\nСейчас на сайте:\n<blockquote>${esc(c.value)}</blockquote>` +
      (changed ? `\nИсходный текст:\n<blockquote>${esc(c.default_value)}</blockquote>` : ""),
    [
      [{ text: "✏️ Изменить", callback_data: `cset:${key}` }],
      ...(changed ? [[{ text: "↩️ Вернуть исходный", callback_data: `creset:${key}` }]] : []),
      [{ text: "◀️ К списку", callback_data: `cl:${c.grp}:0` }, BACK_MENU],
    ],
    editId,
  );
}

/* ------------------------------ Обработчик ------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("ok");

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: rows } = await db
    .from("private_config")
    .select("key, value")
    .in("key", ["tg_admin_token", "tg_admin_secret", "tg_admin_user_id", "admin_state"]);
  const cfg: Cfg = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));

  // запросы не от Telegram (без секрета вебхука) отбрасываем
  if (!cfg.tg_admin_secret || req.headers.get("x-telegram-bot-api-secret-token") !== cfg.tg_admin_secret) {
    return new Response("forbidden", { status: 403 });
  }
  token = cfg.tg_admin_token;
  const adminId = Number(cfg.tg_admin_user_id);

  try {
    const update = await req.json();
    const cb = update.callback_query;
    const msg = update.message;
    const from = cb?.from ?? msg?.from;
    const chatId: number = cb?.message?.chat?.id ?? msg?.chat?.id;
    if (!from || !chatId) return new Response("ok");

    if (from.id !== adminId) {
      if (cb) await tg("answerCallbackQuery", { callback_query_id: cb.id });
      await tg("sendMessage", { chat_id: chatId, text: "⛔️ Доступ запрещён." });
      return new Response("ok");
    }

    /* ---------- нажатия на кнопки ---------- */
    if (cb) {
      await tg("answerCallbackQuery", { callback_query_id: cb.id });
      const editId: number = cb.message.message_id;
      const [cmd, a = "", b = ""] = String(cb.data).split(":");

      if (cmd === "menu") await menu(chatId, editId);
      else if (cmd === "leads") await leadsList(db, chatId, a || "all", Number(b) || 0, editId);
      else if (cmd === "lead") await leadCard(db, chatId, Number(a), editId);
      else if (cmd === "ls") {
        await db.from("leads").update({ status: b, updated_at: new Date().toISOString() }).eq("id", Number(a));
        await leadCard(db, chatId, Number(a), editId);
      } else if (cmd === "chats") await chatsList(db, chatId, Number(a) || 0, editId);
      else if (cmd === "chat") await chatThread(db, chatId, a, editId);
      else if (cmd === "reply") {
        await setState(db, { mode: "reply", visitor: a });
        await tg("sendMessage", {
          chat_id: chatId,
          text: "✍️ Напишите ответ одним сообщением — он появится у посетителя в окне чата на сайте.\nОтмена: /cancel",
        });
      } else if (cmd === "stats") await stats(db, chatId, editId);
      else if (cmd === "content") await contentRoot(chatId, editId);
      else if (cmd === "cl") await contentList(db, chatId, a, Number(b) || 0, editId);
      else if (cmd === "ce") await contentItem(db, chatId, a, editId);
      else if (cmd === "cset") {
        await setState(db, { mode: "edit", key: a });
        await tg("sendMessage", {
          chat_id: chatId,
          text: "✏️ Пришлите новый текст одним сообщением. Перенос строки на сайте сохранится.\nОтмена: /cancel",
        });
      } else if (cmd === "creset") {
        const { data: c } = await db.from("site_content").select("default_value").eq("key", a).single();
        if (c) {
          await db.from("site_content").update({ value: c.default_value, updated_at: new Date().toISOString() }).eq("key", a);
        }
        await tg("sendMessage", { chat_id: chatId, text: `↩️ Исходный текст возвращён. ${SITE_NOTE}` });
        await contentItem(db, chatId, a);
      }
      return new Response("ok");
    }

    /* ---------- текстовые сообщения ---------- */
    const text: string = (msg.text ?? "").trim();
    if (!text) return new Response("ok");

    if (text === "/start" || text === "/menu") {
      await setState(db, null);
      await menu(chatId);
      return new Response("ok");
    }
    if (text === "/cancel") {
      await setState(db, null);
      await tg("sendMessage", { chat_id: chatId, text: "Отменено." });
      await menu(chatId);
      return new Response("ok");
    }
    if (text === "/stats") return (await stats(db, chatId), new Response("ok"));
    if (text === "/leads") return (await leadsList(db, chatId, "all", 0), new Response("ok"));
    if (text === "/chat") return (await chatsList(db, chatId, 0), new Response("ok"));

    const state = cfg.admin_state ? JSON.parse(cfg.admin_state) : null;
    if (state?.mode === "reply") {
      await db.from("chat_messages").insert({ visitor_id: state.visitor, sender: "admin", text: cut(text, 2000) });
      await setState(db, null);
      await show(chatId, "✅ Ответ отправлен — посетитель увидит его в окне чата на сайте.", [
        [{ text: "◀️ К диалогу", callback_data: `chat:${state.visitor}` }, BACK_MENU],
      ]);
      return new Response("ok");
    }
    if (state?.mode === "edit") {
      await db
        .from("site_content")
        .update({ value: cut(text, 3000), updated_at: new Date().toISOString() })
        .eq("key", state.key);
      await setState(db, null);
      await tg("sendMessage", { chat_id: chatId, text: `✅ Сохранено. ${SITE_NOTE}` });
      await contentItem(db, chatId, state.key);
      return new Response("ok");
    }

    await menu(chatId);
    return new Response("ok");
  } catch (e) {
    console.error(e);
    return new Response("ok"); // Telegram не должен повторять упавшее обновление бесконечно
  }
});
