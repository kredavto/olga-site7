"use client";

import Link from "next/link";

const imgSizes = { sm: "h-12", md: "h-16", lg: "h-24" };

export function Logo({
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
      className={`flex items-center group ${className}`}
      aria-label="«ФИНДРАЙВ» — на главную"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo1.png"
        alt="«ФИНДРАЙВ» — займы под залог автомобилей"
        className={`${imgSizes[size]} w-auto rounded-lg drop-shadow-[0_0_14px_rgba(226,182,79,0.4)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105`}
      />
    </Link>
  );
}
