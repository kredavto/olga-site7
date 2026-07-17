"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Magnetic } from "@/components/motion";

function Setup2FA() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "investor";
  const [step, setStep] = useState<"intro" | "verify">("intro");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const goToDashboard = () =>
    router.push(role === "investor" ? "/dashboard/investor" : "/dashboard/borrower");

  const sendCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-2fa-code");
      if (error) {
        toast.error("Ошибка", { description: "Не удалось отправить код" });
        setLoading(false);
        return;
      }
      toast.success("Код отправлен", {
        description: `Код подтверждения отправлен на ${data?.email || "вашу почту"}`,
      });
      setStep("verify");
    } catch {
      toast.error("Ошибка", { description: "Не удалось отправить код" });
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      toast.error("Ошибка", { description: "Введите 6-значный код" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-2fa-code", {
        body: { code },
      });
      if (error || !data?.success) {
        toast.error("Ошибка", {
          description: data?.error || "Неверный или просроченный код",
        });
        setLoading(false);
        return;
      }
      toast.success("2FA подключена!", {
        description: "Двухфакторная авторизация успешно настроена",
      });
      goToDashboard();
    } catch {
      toast.error("Ошибка", { description: "Не удалось проверить код" });
    }
    setLoading(false);
  };

  const resendCode = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke("send-2fa-code");
      toast.success("Код отправлен повторно", { description: "Проверьте вашу почту" });
    } catch {
      toast.error("Ошибка", { description: "Не удалось отправить код" });
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-lines opacity-50" aria-hidden />
      <div className="orb -top-32 left-1/3 h-[26rem] w-[26rem] bg-[#e2b64f]/[0.06]" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong reflect relative w-full max-w-md rounded-3xl p-8 lg:p-10"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e2b64f]/30 bg-[#e2b64f]/10 shadow-[0_0_28px_rgba(226,182,79,0.25)]">
            <ShieldCheck className="text-[#e2b64f]" size={32} />
          </div>
          <h1 className="display text-3xl mb-2">Двухфакторная авторизация</h1>
          <p className="text-[#c6c5c1]">
            Защитите свой аккаунт с помощью кода подтверждения на email
          </p>
        </div>

        {step === "intro" && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 text-[#e2b64f]" size={20} />
                <div>
                  <p className="font-semibold text-sm mb-1">Email-код</p>
                  <p className="text-base leading-relaxed text-[#c6c5c1]">
                    При каждом входе вам будет отправлен 6-значный код на вашу электронную
                    почту для подтверждения
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Magnetic className="block w-full" strength={0.1}>
                <button className="btn-gold h-13 w-full py-3.5 text-base" onClick={sendCode} disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  Подключить 2FA
                </button>
              </Magnetic>
              <button
                className="btn-ghost h-12 w-full text-base text-[#c6c5c1]"
                onClick={goToDashboard}
              >
                <ArrowRight size={16} />
                Пропустить
              </button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-5">
            <p className="text-center text-base leading-relaxed text-[#c6c5c1]">
              Мы отправили код подтверждения на вашу электронную почту. Введите его ниже.
            </p>
            <div>
              <label className="lux-label">Код подтверждения</label>
              <input
                className="lux-input text-center font-mono text-2xl tracking-[0.5em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button
              className="btn-gold h-13 w-full py-3.5 text-base"
              onClick={verifyCode}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-1 animate-spin" size={16} /> : null}
              Подтвердить
            </button>
            <div className="flex gap-2">
              <button
                className="btn-ghost h-11 flex-1 text-sm"
                onClick={() => {
                  setStep("intro");
                  setCode("");
                }}
              >
                Назад
              </button>
              <button
                className="btn-ghost h-11 flex-1 text-sm"
                onClick={resendCode}
                disabled={loading}
              >
                Отправить повторно
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Setup2FAPage() {
  return (
    <Suspense fallback={null}>
      <Setup2FA />
    </Suspense>
  );
}
