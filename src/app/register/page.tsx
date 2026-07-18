"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import { Magnetic } from "@/components/motion";

const LEAD_EMAIL = "findrive78@yandex.ru";
const STORAGE_BUCKET = "documents";

function RegisterForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: searchParams.get("phone") || "+7 ",
    amount: "",
    email: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const setField = (field: string, value: string) => setForm({ ...form, [field]: value });

  // возврат с FormSubmit после нативной отправки с вложениями
  useEffect(() => {
    if (searchParams.get("sent")) {
      toast.success("Заявка отправлена!", {
        description: "Мы свяжемся с вами в ближайшее время",
      });
      const t = setTimeout(() => router.push("/"), 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!form.name || !form.phone) {
      toast.error("Ошибка", { description: "Заполните имя и телефон" });
      return;
    }
    setSubmitting(true);
    try {
      // резервная копия файлов в хранилище (не блокирует отправку заявки)
      const uploadedUrls: string[] = [];
      const prefix = `${Date.now()}_${form.phone.replace(/\D/g, "") || "lead"}`;
      for (const file of files) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${prefix}/${safeName}`;
        try {
          const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, file, { cacheControl: "3600", upsert: false });
          if (error) throw new Error(error.message);
          const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
          uploadedUrls.push(data.publicUrl);
        } catch {
          // хранилище недоступно — файлы всё равно уйдут вложениями в письме
        }
      }

      // основной канал: Telegram (файлы приходят документами в чат)
      let sent = false;
      try {
        const { data, error } = await supabase.functions.invoke("send-lead", {
          body: {
            name: form.name,
            phone: form.phone,
            amount: form.amount,
            email: form.email,
            fileUrls: uploadedUrls,
          },
        });
        sent = !error && !!data?.success;
      } catch {
        sent = false;
      }

      // дублирующий канал: письмо на почту (со ссылками на файлы)
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${LEAD_EMAIL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: "Новая заявка с сайта «ФИНДРАЙВ»",
            _template: "table",
            Имя: form.name,
            Телефон: form.phone,
            Сумма: form.amount || "—",
            Email: form.email || "—",
            "Фото документов": uploadedUrls.length ? uploadedUrls.join("\n") : "не приложены",
          }),
        });
        if (res.ok) sent = true;
      } catch {
        // почтовый канал не сработал — достаточно Telegram
      }

      if (!sent) throw new Error("Не удалось отправить заявку");

      toast.success("Заявка отправлена!", {
        description: "Мы свяжемся с вами в ближайшее время",
      });
      setForm({ name: "", phone: "", amount: "", email: "" });
      setFiles([]);
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      toast.error("Ошибка отправки", {
        description: err instanceof Error ? err.message : "Попробуйте позже",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 py-16">
      <div className="absolute inset-0 grid-lines opacity-50" aria-hidden />
      <div className="orb -top-32 right-1/4 h-[28rem] w-[28rem] bg-[#e2b64f]/[0.06]" aria-hidden />
      <div className="light-sweep" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong reflect relative w-full max-w-lg rounded-3xl p-8 lg:p-10"
      >
        <div className="mb-8 text-center">
          <Logo size="md" className="justify-center mb-6" />
          <h1 className="display text-3xl mb-2">Подать заявку</h1>
          <p className="text-[#c6c5c1]">Оставьте контакты — перезвоним и всё расскажем</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="lux-label">Ваше Имя *</label>
            <input
              className="lux-input"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Иван"
            />
          </div>
          <div>
            <label className="lux-label">Телефон *</label>
            <input
              className="lux-input"
              type="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div>
            <label className="lux-label">Сумма *</label>
            <input
              className="lux-input"
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
              placeholder="500 000 ₽"
            />
          </div>
          <div>
            <label className="lux-label">Email</label>
            <input
              className="lux-input"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="ivan@mail.ru"
            />
          </div>
          <div>
            <label className="lux-label">Фото документов</label>
            <input
              id="docs-upload"
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            <button
              type="button"
              className="btn-ghost h-[3.25rem] w-full rounded-[0.9rem] text-sm"
              onClick={() => document.getElementById("docs-upload")?.click()}
            >
              <Upload size={16} />
              Загрузить фото документов
            </button>
            {files.length > 0 && (
              <p className="mt-2 text-base text-[#c6c5c1]">
                Выбрано файлов: {files.length} — {files.map((f) => f.name).join(", ")}
              </p>
            )}
          </div>

          <Magnetic className="block w-full pt-1" strength={0.1}>
            <button
              className="btn-gold glow-pulse h-14 w-full text-base"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Отправка..." : "Подать заявку"}
            </button>
          </Magnetic>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
