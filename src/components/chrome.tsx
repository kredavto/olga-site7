"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";

/* ------------------------------------------------------------------ */
/* SmoothScroll: Lenis-powered inertia scrolling                        */
/* ------------------------------------------------------------------ */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* PageLoader: black minimal loader — mark, progress bar, soft fade     */
/* ------------------------------------------------------------------ */
export function PageLoader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060607]"
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo1.png"
              alt="«ФИНДРАЙВ» — займы под залог автомобилей"
              className="w-72 sm:w-80 lg:w-96 h-auto drop-shadow-[0_0_40px_rgba(226,182,79,0.45)]"
            />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-center font-heading text-sm sm:text-base font-medium uppercase tracking-[0.32em] gold-text-gradient"
            >
              Будь первым у цели
            </motion.p>
          </motion.div>
          <div className="mt-10 h-px w-56 overflow-hidden bg-white/10 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#b8892b] via-[#e2b64f] to-[#f0cd7a]"
              style={{ animation: "loader-bar 1.4s cubic-bezier(0.22,1,0.36,1) forwards" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* CursorGlow: soft gold light following the pointer                    */
/* ------------------------------------------------------------------ */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let tx = -400;
    let ty = -400;
    let cx = tx;
    let cy = ty;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      if (ref.current) ref.current.style.transform = `translate3d(${cx - 250}px, ${cy - 250}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] hidden h-[500px] w-[500px] rounded-full md:block"
      style={{
        background:
          "radial-gradient(circle, rgba(226,182,79,0.05) 0%, rgba(226,182,79,0.015) 40%, transparent 70%)",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* FindriveMark: brand mark (gold monogram in a ring)                   */
/* ------------------------------------------------------------------ */
export function FindriveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="fdg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0cd7a" />
          <stop offset="0.55" stopColor="#e2b64f" />
          <stop offset="1" stopColor="#b8892b" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" stroke="url(#fdg)" strokeWidth="2" opacity="0.9" />
      <circle cx="32" cy="32" r="23.5" stroke="url(#fdg)" strokeWidth="0.75" opacity="0.35" />
      {/* Ф monogram */}
      <path
        d="M32 16v32M32 21c-6.6 0-11 3.4-11 8.5S25.4 38 32 38s11-3.4 11-8.5S38.6 21 32 21z"
        stroke="url(#fdg)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
