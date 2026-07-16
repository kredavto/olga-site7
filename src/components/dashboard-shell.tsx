"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, Settings, LogOut } from "lucide-react";
import { Logo } from "./logo";

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#08080a]">
      <header className="sticky top-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-[#f0cd7a]" aria-label="Уведомления">
              <Bell size={18} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-[#f0cd7a]" aria-label="Настройки">
              <Settings size={18} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-[#f0cd7a]"
              onClick={() => router.push("/login")}
              aria-label="Выйти"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <div className="container py-10">
        <h1 className="display text-3xl lg:text-4xl mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="lux-card reflect rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e2b64f]/25 bg-[#e2b64f]/10">
          <Icon size={20} className="text-[#e2b64f]" />
        </div>
        <div>
          <p className="text-sm text-[#9b9a97]">{label}</p>
          <p className="display text-xl">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-[#f0cd7a] to-[#b8892b] text-[#0b0a07] shadow-[0_6px_24px_-8px_rgba(226,182,79,0.6)]"
          : "border border-white/10 text-[#9b9a97] hover:border-[#e2b64f]/40 hover:text-[#f0cd7a]"
      }`}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs ${
        status === "Активный"
          ? "border border-[#e2b64f]/30 bg-[#e2b64f]/10 text-[#f0cd7a]"
          : "border border-white/10 bg-white/5 text-[#9b9a97]"
      }`}
    >
      {status}
    </span>
  );
}
