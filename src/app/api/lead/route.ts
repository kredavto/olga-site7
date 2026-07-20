import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEAD_EMAIL = "findrive78@yandex.ru";
const ALLOWED_URL_PREFIX = "https://xduywwgvgexbiggbuzgy.supabase.co/storage/v1/object/public/documents/";
const MAX_TOTAL_ATTACHMENTS = 25 * 1024 * 1024;

export async function POST(req: Request) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ error: "SMTP is not configured" }, { status: 501 });
  }

  let body: {
    name?: string;
    phone?: string;
    amount?: string;
    email?: string;
    fileUrls?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.name || !body.phone) {
    return NextResponse.json({ error: "Заполните имя и телефон" }, { status: 400 });
  }

  // качаем файлы из хранилища на сервере и прикладываем к письму
  const attachments: { filename: string; content: Buffer }[] = [];
  let total = 0;
  for (const url of (body.fileUrls ?? []).slice(0, 10)) {
    if (typeof url !== "string" || !url.startsWith(ALLOWED_URL_PREFIX)) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (total + buf.length > MAX_TOTAL_ATTACHMENTS) continue;
      total += buf.length;
      attachments.push({
        filename: decodeURIComponent(url.split("/").pop() || "file"),
        content: buf,
      });
    } catch {
      // файл не скачался — ссылка всё равно будет в тексте письма
    }
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const lines = [
    `Имя: ${body.name}`,
    `Телефон: ${body.phone}`,
    `Сумма: ${body.amount || "—"}`,
    `Email: ${body.email || "—"}`,
    `Фото документов: ${
      attachments.length
        ? `во вложении (${attachments.map((a) => a.filename).join(", ")})`
        : "не приложены"
    }`,
    ...(body.fileUrls?.length ? ["", "Ссылки на файлы:", ...body.fileUrls] : []),
  ];

  try {
    await transporter.sendMail({
      from: `«ФИНДРАЙВ» — заявки <${smtpUser}>`,
      to: LEAD_EMAIL,
      subject: "Новая заявка с сайта «ФИНДРАЙВ»",
      text: lines.join("\n"),
      attachments,
    });
  } catch {
    return NextResponse.json({ error: "Не удалось отправить письмо" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
