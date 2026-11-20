// История диалога для окна чата на сайте: сообщения посетителя и ответы администратора.
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const visitorId = String(body?.visitorId ?? "").trim();
    const afterId = Number(body?.afterId) || 0;
    // идентификатор посетителя — единственный ключ к его переписке
    if (!/^[A-Za-z0-9_-]{6,64}$/.test(visitorId)) return json({ error: "bad visitor id" }, 400);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await db
      .from("chat_messages")
      .select("id, sender, text, created_at")
      .eq("visitor_id", visitorId)
      .gt("id", afterId)
      .order("id", { ascending: true })
      .limit(100);
    if (error) return json({ error: error.message }, 500);
    return json({ messages: data ?? [] });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
