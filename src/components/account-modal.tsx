"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, MailCheck, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Logo } from "./logo";

/** login — вход по email, register — регистрация, sent — письмо отправлено */
type Step = "login" | "register" | "sent";

export function AccountModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [consent, setConsent] = useState(false);
  const [returnStep, setReturnStep] = useState<Step>("login");

  const router = useRouter();

  useEffect(() => {
    const openAccount = () => {
      setStep("login");
      setOpen(true);
    };
    window.addEventListener("findrive:open-account", openAccount);
    return () => window.removeEventListener("findrive:open-account", openAccount);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Отправка письма со ссылкой для входа */
  const sendCode = async (mode: "login" | "register") => {
    if (mode === "register") {
      if (!fullName.trim()) {
        toast.error("Ошибка", { description: "Укажите фамилию и имя" });
        return;
      }
      if (!phone.trim()) {
        toast.error("Ошибка", { description: "Укажите номер телефона" });
        return;
      }
      if (!consent) {
        toast.error("Ошибка", {
          description: "Необходимо согласие на обработку персональных данных",
        });
        return;
      }
    }
    if (!email.trim()) {
      toast.error("Ошибка", { description: "Укажите электронную почту" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: mode === "register",
        data:
          mode === "register"
            ? { full_name: fullName.trim(), phone: phone.trim() }
            : undefined,
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setLoading(false);

    if (error) {
      const notRegistered = /signups not allowed|user not found/i.test(error.message);
      toast.error(mode === "login" ? "Не удалось войти" : "Ошибка регистрации", {
        description: notRegistered
          ? "Такая почта не зарегистрирована. Пройдите регистрацию."
          : error.message,
      });
      return;
    }

    setReturnStep(mode);
    setStep("sent");
    toast.success("Письмо отправлено", {
      description: `Проверьте почту ${email.trim()} и перейдите по ссылке из письма.`,
    });
  };

  const title =
    step === "login"
      ? "Вход в личный кабинет"
      : step === "register"
        ? "Регистрация нового пользователя"
        : "Письмо отправлено";

  const subtitle =
    step === "login"
      ? "Введите электронную почту — мы пришлём ссылку для входа"
      : step === "register"
        ? "Заполните данные, чтобы создать аккаунт"
        : `Ссылка для входа отправлена на ${email.trim() || "вашу почту"}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10 backdrop-blur-md"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong reflect relative my-auto w-full max-w-md rounded-3xl p-7 sm:p-9"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-[#a5a4a0] transition-colors hover:bg-white/5 hover:text-[#f0cd7a]"
            >
              <X size={19} />
            </button>

            <div className="mb-7 text-center">
              <Logo size="md" className="mb-5 justify-center" />
              <h2 className="display mb-2 text-2xl sm:text-3xl">{title}</h2>
              <p className="text-[1.05rem] text-[#c6c5c1]">{subtitle}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {step === "register" && (
                  <>
                    <div>
                      <label className="lux-label" htmlFor="acc-name">
                        Фамилия и имя
                      </label>
                      <input
                        id="acc-name"
                        className="lux-input"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Иванов Иван"
                      />
                    </div>
                    <div>
                      <label className="lux-label" htmlFor="acc-phone">
                        Номер телефона
                      </label>
                      <input
                        id="acc-phone"
                        className="lux-input"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7"
                      />
                    </div>
                  </>
                )}

                {(step === "login" || step === "register") && (
                  <div>
                    <label className="lux-label" htmlFor="acc-email">
                      Электронная почта
                    </label>
                    <input
                      id="acc-email"
                      className="lux-input"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && step === "login" && sendCode("login")}
                      placeholder="ivan@mail.ru"
                    />
                  </div>
                )}

                {step === "register" && (
                  <button
                    type="button"
                    onClick={() => setConsent((v) => !v)}
                    aria-pressed={consent}
                    className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-[#e2b64f]/30"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-300 ${
                        consent
                          ? "border-[#e2b64f] bg-gradient-to-br from-[#f0cd7a] to-[#b8892b] text-[#0b0a07]"
                          : "border-white/25 bg-transparent"
                      }`}
                    >
                      {consent && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className="text-[0.98rem] leading-snug text-[#c6c5c1]">
                      Даю согласие на обработку персональных данных
                    </span>
                  </button>
                )}

                {step === "sent" && (
                  <div className="rounded-2xl border border-[#e2b64f]/25 bg-[#e2b64f]/[0.06] p-5 text-center">
                    <MailCheck size={30} className="mx-auto mb-3 text-[#e2b64f]" />
                    <p className="text-[1.05rem] leading-relaxed text-[#e6e5e1]">
                      Откройте письмо и перейдите по ссылке — вход выполнится автоматически.
                    </p>
                    <p className="mt-3 text-[0.95rem] leading-snug text-[#a5a4a0]">
                      Письмо приходит в течение минуты. Если письма нет — проверьте папку «Спам».
                    </p>
                  </div>
                )}

                {step !== "sent" && (
                  <button
                    className="btn-gold h-14 w-full text-base"
                    disabled={loading}
                    onClick={() => sendCode(step)}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Подождите...
                      </span>
                    ) : step === "login" ? (
                      "Получить ссылку для входа"
                    ) : (
                      "Регистрация"
                    )}
                  </button>
                )}

                {step === "sent" ? (
                  <div className="flex items-center justify-between gap-4 text-[1.02rem]">
                    <button
                      onClick={() => setStep(returnStep)}
                      className="flex items-center gap-1.5 text-[#c6c5c1] transition-colors hover:text-[#f0cd7a]"
                    >
                      <ArrowLeft size={15} />
                      Назад
                    </button>
                    <button
                      onClick={() => sendCode(returnStep === "register" ? "register" : "login")}
                      className="font-medium text-[#e2b64f] transition-colors hover:text-[#f0cd7a] hover:underline"
                    >
                      Отправить письмо ещё раз
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-[1.02rem] text-[#c6c5c1]">
                    {step === "login" ? (
                      <>
                        Не регистрировались раньше?{" "}
                        <button
                          onClick={() => setStep("register")}
                          className="font-medium text-[#e2b64f] transition-colors hover:text-[#f0cd7a] hover:underline"
                        >
                          Создать аккаунт
                        </button>
                      </>
                    ) : (
                      <>
                        Уже есть аккаунт?{" "}
                        <button
                          onClick={() => setStep("login")}
                          className="font-medium text-[#e2b64f] transition-colors hover:text-[#f0cd7a] hover:underline"
                        >
                          Войти
                        </button>
                      </>
                    )}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
