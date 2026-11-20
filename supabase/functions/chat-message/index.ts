// Сообщение из чата на сайте: сохраняем в базу и уведомляем администратора в Telegram.
// Если подключён бот админ-панели — уведомление приходит туда с кнопкой «Ответить»,
// иначе в чат-бота, как раньше, а при его сбое — в бота заявок.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function tgSend(token: string, chatId: string, text: string, extra: Record<string, unknown> = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
  return await res.json();
}

async function discoverChatId(token: string) {
  try {
    const upd = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json();
    const withChat = (upd.result ?? [])
      .reverse()
      .find((u: { message?: { chat?: { id?: number } } }) => u.message?.chat?.id);
    return withChat?.message?.chat?.id?.toString() as string | undefined;
  } catch {
    return undefined;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const text = String(body?.text ?? "").slice(0, 2000).trim();
    const contact = String(body?.contact ?? "").slice(0, 200).trim();
    const visitorId = String(body?.visitorId ?? "").slice(0, 64).trim();
    if (!text) return json({ error: "text required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // переписка хранится в базе — из неё администратор отвечает через бота
    let messageId: number | null = null;
    if (/^[A-Za-z0-9_-]{6,64}$/.test(visitorId)) {
      const { data: row } = await admin
        .from("chat_messages")
        .insert({ visitor_id: visitorId, contact: contact || null, sender: "visitor", text })
        .select("id")
        .single();
      messageId = row?.id ?? null;
    }

    const { data: rows } = await admin
      .from("private_config")
      .select("key, value")
      .in("key", [
        "tg_admin_token",
        "tg_admin_user_id",
        "tg_chat_token",
        "tg_chat_target",
        "tg_token",
        "tg_chat_id",
      ]);
    const cfg = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));

    const message = [
      "\u{1F4AC} Сообщение из чата на сайте «ФИНДРАЙВ»",
      "",
      text,
      "",
      `Контакт для ответа: ${contact || "не указан"}`,
      `Посетитель: #${visitorId.slice(0, 6) || "—"}`,
    ].join("\n");

    const attempts: unknown[] = [];

    // 1) бот админ-панели — с кнопкой ответа прямо в окно чата на сайте
    if (cfg.tg_admin_token && cfg.tg_admin_user_id && messageId) {
      const sent = await tgSend(cfg.tg_admin_token, cfg.tg_admin_user_id, message, {
        reply_markup: {
          inline_keyboard: [[
            { text: "✍️ Ответить", callback_data: `reply:${visitorId}` },
            { text: "💬 Весь диалог", callback_data: `chat:${visitorId}` },
          ]],
        },
      });
      if (sent.ok) return json({ success: true, via: "admin-bot", id: messageId });
      attempts.push({ bot: "admin", detail: sent });
    }

    // 2) отдельный чат-бот
    const chatToken = cfg.tg_chat_token;
    if (chatToken) {
      let chatId = cfg.tg_chat_target;
      if (!chatId) {
        chatId = await discoverChatId(chatToken);
        if (chatId) {
          await admin.from("private_config").upsert({ key: "tg_chat_target", value: chatId });
        }
      }
      if (chatId) {
        const sent = await tgSend(chatToken, chatId, message);
        if (sent.ok) return json({ success: true, via: "chat-bot", id: messageId });
        attempts.push({ bot: "chat", detail: sent });
      } else {
        attempts.push({ bot: "chat", detail: "chat_id not resolved" });
      }
    }

    // 3) запасной канал — бот заявок
    if (cfg.tg_token && cfg.tg_chat_id) {
      const sent = await tgSend(cfg.tg_token, cfg.tg_chat_id, message);
      if (sent.ok) return json({ success: true, via: "lead-bot", id: messageId });
      attempts.push({ bot: "lead", detail: sent });
    }

    // сообщение уже в базе — администратор увидит его в боте, даже если уведомление не дошло
    if (messageId) return json({ success: true, via: "db-only", id: messageId, attempts });
    return json({ error: "telegram sendMessage failed", attempts }, 502);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
