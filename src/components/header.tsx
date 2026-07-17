"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Magnetic } from "./motion";

const NAV = [
  { label: "Заёмщикам", id: "features" },
  { label: "Инвесторам", id: "invest" },
  { label: "Партнёрская программа", id: "partners" },
  { label: "О компании", id: "faq" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    if (pathname !== "/") {
      router.push("/#" + id);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-3 pt-3 lg:px-6 lg:pt-4"
    >
      <div
        className={`mx-auto flex h-20 md:h-28 max-w-7xl items-center justify-between gap-4 rounded-2xl px-4 lg:px-6 transition-all duration-500 ${
          scrolled ? "glass-strong shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)]" : "bg-transparent border border-transparent"
        }`}
      >
        <Logo size="sm" />

        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="group relative py-2 font-medium text-[1.05rem] text-[#c6c5c1] transition-colors duration-300 hover:text-[#f0cd7a]"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#e2b64f] to-transparent transition-all duration-500 group-hover:w-full" />
            </button>
          ))}
          <a
            href="https://wa.me/79219888880"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative py-2 font-medium text-[1.05rem] text-[#c6c5c1] transition-colors duration-300 hover:text-[#f0cd7a]"
          >
            Чат
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#e2b64f] to-transparent transition-all duration-500 group-hover:w-full" />
          </a>
        </nav>

        <div className="hidden md:block shrink-0">
          <Magnetic>
            <button
              onClick={() => router.push("/register?role=borrower")}
              className="btn-gold h-11 px-6 text-sm"
            >
              Подать заявку
            </button>
          </Magnetic>
        </div>

        <button
          className="md:hidden ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden mx-auto mt-2 max-w-7xl glass-strong rounded-2xl p-4 space-y-1"
          >
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-[#d6d5d1] transition-colors hover:bg-white/5 hover:text-[#f0cd7a]"
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://wa.me/79219888880"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-[#d6d5d1] transition-colors hover:bg-white/5 hover:text-[#f0cd7a]"
            >
              Чат
            </a>
            <div className="pt-2">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/register?role=borrower");
                }}
                className="btn-gold h-12 w-full text-sm"
              >
                Подать заявку
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
