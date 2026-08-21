"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Переход по ссылке из письма может привести на любую страницу сайта
 * (Supabase подставляет адрес из своих настроек). Здесь мы ловим такой переход
 * и сами отправляем человека в личный кабинет.
 */
export function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth/")) return;

    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const cameFromEmail =
      Boolean(url.searchParams.get("code")) ||
      Boolean(url.searchParams.get("token_hash")) ||
      Boolean(hash.get("access_token"));

    if (!cameFromEmail) return;

    let cancelled = false;

    const go = async () => {
      const code = url.searchParams.get("code");
      if (code) await supabase.auth.exchangeCodeForSession(code).catch(() => undefined);

      for (let attempt = 0; attempt < 20; attempt++) {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .single();
          // убираем служебные параметры из адреса
          window.history.replaceState({}, "", window.location.pathname);
          router.replace(
            profile?.role === "investor" ? "/dashboard/investor" : "/dashboard/borrower",
          );
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
    };

    go();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
