"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import { Magnetic } from "@/components/motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Ошибка", { description: "Заполните все поля" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Ошибка входа", { description: error.message });
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();
    toast.success("Вход выполнен", { description: "Добро пожаловать!" });
    router.push(profile?.role === "borrower" ? "/dashboard/borrower" : "/dashboard/investor");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-lines opacity-50" aria-hidden />
      <div className="orb -bottom-32 left-1/4 h-[26rem] w-[26rem] bg-[#e2b64f]/[0.06]" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong reflect relative w-full max-w-md rounded-3xl p-8 lg:p-10"
      >
        <div className="mb-8 text-center">
          <Logo size="md" className="justify-center mb-6" />
          <h1 className="display text-3xl mb-2">Вход в личный кабинет</h1>
          <p className="text-[#9b9a97]">Введите email и пароль</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="lux-label">Email</label>
            <input
              className="lux-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@mail.ru"
            />
          </div>
          <div>
            <label className="lux-label">Пароль</label>
            <input
              className="lux-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <Magnetic className="block w-full pt-1" strength={0.1}>
            <button
              className="btn-gold h-14 w-full text-base"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </Magnetic>

          <p className="text-center text-sm text-[#9b9a97]">
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="font-medium text-[#e2b64f] transition-colors hover:text-[#f0cd7a] hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
