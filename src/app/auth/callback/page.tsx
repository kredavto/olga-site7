"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";

/**
 * Возврат по ссылке из письма: подтверждаем вход и отправляем в личный кабинет.
 * Поддерживает и ссылку с кодом (?code=...), и ссылку с токенами в адресе (#access_token=...).
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errorDescription =
        url.searchParams.get("error_description") ??
        new URLSearchParams(url.hash.replace(/^#/, "")).get("error_description");

      if (errorDescription) {
        setError(errorDescription);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("Ссылка недействительна или уже использована. Запросите новое письмо.");
          return;
        }
      }

      // ссылка с токенами в хеше обрабатывается клиентом автоматически — ждём сессию
      for (let attempt = 0; attempt < 20; attempt++) {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .single();
          router.replace(
            profile?.role === "investor" ? "/dashboard/investor" : "/dashboard/borrower",
          );
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }

      setError("Не удалось подтвердить вход. Запросите новое письмо со ссылкой.");
    };

    finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-lines opacity-50" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong reflect relative w-full max-w-md rounded-3xl p-9 text-center"
      >
        <Logo size="md" className="mb-6 justify-center" />
        {error ? (
          <>
            <h1 className="display mb-3 text-2xl">Не удалось войти</h1>
            <p className="mb-7 text-[1.05rem] text-[#c6c5c1]">{error}</p>
            <button onClick={() => router.replace("/")} className="btn-gold h-13 w-full px-6">
              Вернуться на сайт
            </button>
          </>
        ) : (
          <>
            <h1 className="display mb-3 text-2xl">Подтверждаем вход</h1>
            <p className="mb-7 text-[1.05rem] text-[#c6c5c1]">
              Секунду — открываем ваш личный кабинет.
            </p>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#e2b64f]" />
          </>
        )}
      </motion.div>
    </div>
  );
}
