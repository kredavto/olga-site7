// Заявка с сайта: сохраняем в базу (для админ-панели) и отправляем в Telegram с файлами.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_FILE = 50 * 1024 * 1024; // лимит Telegram на загрузку файла ботом
const KIND_TITLE: Record<string, string> = {
  borrower: "Новая заявка с сайта «ФИНДРАЙВ»",
  partner: "Заявка на участие в партнёрской программе",
  investor: "Заявка от инвестора",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const name = clip(body.name, 200);
    const phone = clip(body.phone, 50);
    const email = clip(body.email, 200);
    const amount = clip(body.amount, 100);
    const term = clip(body.term, 100);
    const consents = clip(body.consents, 500);
    const kind = ["borrower", "partner", "investor"].includes(body.kind) ? body.kind : "borrower";
    if (!name || !phone) return json({ error: "name and phone required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const urls: string[] = Array.isArray(body.fileUrls)
      ? body.fileUrls.filter((u: unknown) => typeof u === "string").slice(0, 10)
      : [];

    // заявка сохраняется в базу до отправки в Telegram — не потеряется при сбое бота
    const { data: lead } = await admin
      .from("leads")
      .insert({
        kind,
        name,
        phone,
        email: email || null,
        amount: amount || null,
        term: term || null,
        consents: consents || null,
        file_urls: urls,
      })
      .select("id")
      .single();

    const { data: rows } = await admin
      .from("private_config")
      .select("key, value")
      .in("key", ["tg_token", "tg_chat_id"]);
    const cfg = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
    const token = cfg.tg_token;
    if (!token) return json({ success: !!lead, id: lead?.id, telegram: "not configured" });

    let chatId = cfg.tg_chat_id;
    if (!chatId) {
      const upd = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json();
      const withChat = (upd.result ?? [])
        .reverse()
        .find((u: { message?: { chat?: { id?: number } } }) => u.message?.chat?.id);
      chatId = withChat?.message?.chat?.id?.toString();
      if (!chatId) {
        return json(
          { error: "chat not found: напишите боту любое сообщение и повторите" },
          424,
        );
      }
      await admin.from("private_config").upsert({ key: "tg_chat_id", value: chatId });
    }

    const lines = [
      `\u{1F514} ${KIND_TITLE[kind]}${lead?.id ? ` — №${lead.id}` : ""}`,
      "",
      `Имя: ${name}`,
      `Телефон: ${phone}`,
    ];
    if (kind !== "partner") lines.push(`${kind === "investor" ? "Сумма инвестиций" : "Сумма"}: ${amount || "—"}`);
    if (kind === "investor") lines.push(`Срок инвестиций: ${term || "—"}`);
    lines.push(`Email: ${email || "—"}`);
    if (kind === "borrower") {
      lines.push(`Фото документов: ${urls.length ? `${urls.length} файл(ов) ниже` : "не приложены"}`);
    }
    lines.push("", `Согласия: ${consents || "—"}`);

    const sm = await (
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: lines.join("\n") }),
      })
    ).json();
    if (!sm.ok) {
      // заявка уже в базе — сайт не должен показывать клиенту ошибку
      if (lead) return json({ success: true, id: lead.id, telegram: "failed" });
      return json({ error: "telegram sendMessage failed", detail: sm }, 502);
    }

    // скачиваем файл сами и грузим в Telegram multipart'ом —
    // скачивание по URL на стороне Telegram ограничено 5–20 МБ и ненадёжно
    const failed: string[] = [];
    for (const url of urls) {
      let ok = false;
      try {
        const fileRes = await fetch(url);
        if (fileRes.ok) {
          const blob = await fileRes.blob();
          if (blob.size > 0 && blob.size <= MAX_FILE) {
            const filename = decodeURIComponent(url.split("/").pop() || "file");
            const fd = new FormData();
            fd.append("chat_id", chatId);
            fd.append("document", blob, filename);
            const sent = await (
              await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
                method: "POST",
                body: fd,
              })
            ).json();
            ok = !!sent.ok;
          }
        }
      } catch {
        ok = false;
      }
      if (!ok) failed.push(url);
    }

    // что не загрузилось — хотя бы ссылками одним сообщением
    if (failed.length) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `⚠️ Не удалось передать файлами, доступны по ссылкам:\n${failed.join("\n")}`,
        }),
      });
    }

    return json({
      success: true,
      id: lead?.id,
      delivered: urls.length - failed.length,
      failed: failed.length,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
