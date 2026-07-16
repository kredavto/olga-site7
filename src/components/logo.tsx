"use client";

import Link from "next/link";
import { FindriveMark } from "./chrome";

const markSizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };

export function Logo({
  iconOnly = false,
  className = "",
  size = "md",
}: {
  iconOnly?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 group ${className}`}
      aria-label="«ФИНДРАЙВ» — на главную"
    >
      <span className="drop-shadow-[0_0_12px_rgba(226,182,79,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:rotate-[8deg]">
        <FindriveMark className={markSizes[size]} />
      </span>
      {!iconOnly && (
        <span
          className={`display uppercase tracking-[0.14em] gold-text-gradient ${textSizes[size]}`}
        >
          «ФИНДРАЙВ»
        </span>
      )}
    </Link>
  );
}
