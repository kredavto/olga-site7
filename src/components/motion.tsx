"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";

/* ------------------------------------------------------------------ */
/* Reveal: fade + rise + blur on scroll                                */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* WordReveal: staggered per-word mask reveal for headings             */
/* ------------------------------------------------------------------ */
export function WordReveal({
  text,
  className,
  delay = 0,
  as: Tag = "span",
  wordClassName = "",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  wordClassName?: string;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`inline-block will-change-transform ${wordClassName}`}
          initial={{ opacity: 0, y: "0.6em", filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* AnimatedNumber: smooth spring-driven value transitions               */
/* ------------------------------------------------------------------ */
export function AnimatedNumber({
  value,
  format = (v: number) => Math.round(v).toLocaleString("ru-RU"),
  className,
}: {
  value: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 120, damping: 22 });
  const [text, setText] = useState(format(value));
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setText(format(value));
      return;
    }
    mv.set(value);
    const unsub = spring.on("change", (v) => setText(format(v)));
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);

  return <span className={`tabular-nums ${className ?? ""}`}>{text}</span>;
}

/* ------------------------------------------------------------------ */
/* CountUp: counts numeric part of a stat string when scrolled in view */
/* ------------------------------------------------------------------ */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(value);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const match = value.match(/[\d\s.,]*\d/);
    if (!match) return;
    const numStr = match[0];
    const target = parseFloat(numStr.replace(/\s/g, "").replace(",", "."));
    if (isNaN(target)) return;
    const decimals = /[.,]\d/.test(numStr) ? 1 : 0;
    const useSpaces = /\d\s\d/.test(numStr);
    const start = performance.now();
    const dur = 1600;
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      let cur = (target * eased).toFixed(decimals).replace(".", ",");
      if (useSpaces) {
        const [int, dec] = cur.split(",");
        cur = parseInt(int, 10).toLocaleString("ru-RU").replace(/ /g, " ") + (dec ? "," + dec : "");
      }
      setDisplay(value.replace(numStr, cur));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduced]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {display}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic: element gently follows the cursor                          */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.25,
  className,
  ...rest
}: { children: ReactNode; strength?: number; className?: string } & HTMLMotionProps<"div">) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className ?? ""}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* TiltCard: 3D perspective tilt + dynamic light spot                   */
/* ------------------------------------------------------------------ */
export function TiltCard({
  children,
  className,
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateY(${(px - 0.5) * max * 2}deg) rotateX(${-(py - 0.5) * max * 2}deg) translateZ(16px)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0)";
  };

  return (
    <div className="scene-3d">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`tilt-3d spotlight ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}
