"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, CreditCard, FileText, Landmark, Wallet } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth-context";
import { DashboardShell, StatCard, StatusBadge, TabButton } from "@/components/dashboard-shell";
import { Progress } from "@/components/ui/progress";

const tranches = [
  { id: "T-001", amount: "2 500 000 ₽", rate: "19.2%", due: "15.10.2026", paid: 35 },
  { id: "T-002", amount: "1 750 000 ₽", rate: "20.5%", due: "22.06.2026", paid: 58 },
];

const paymentSchedule = [
  { date: "15 апр 2026", amount: "156 800 ₽", status: "upcoming" },
  { date: "15 мар 2026", amount: "156 800 ₽", status: "paid" },
  { date: "15 фев 2026", amount: "156 800 ₽", status: "paid" },
  { date: "15 янв 2026", amount: "156 800 ₽", status: "paid" },
];

const loanHistory = [
  { id: "T-001", amount: "2 500 000 ₽", rate: "19.2%", date: "15.10.2025", status: "Активный" },
  { id: "T-002", amount: "1 750 000 ₽", rate: "20.5%", date: "22.06.2025", status: "Активный" },
  { id: "T-003", amount: "3 000 000 ₽", rate: "21.0%", date: "01.01.2025", status: "Погашен" },
];

const documents = [
  { name: "Договор займа T-001", date: "15.10.2025", type: "PDF" },
  { name: "Договор займа T-002", date: "22.06.2025", type: "PDF" },
  { name: "График платежей T-001", date: "15.10.2025", type: "PDF" },
  { name: "Акт сверки за 2025", date: "01.01.2026", type: "PDF" },
];

export default function BorrowerDashboardPage() {
  const [tab, setTab] = useState<"overview" | "loans" | "documents">("overview");

  return (
    <ProtectedRoute>
      <DashboardShell title="Личный кабинет заёмщика">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Landmark} label="Одобренный лимит" value="15 000 000 ₽" />
          <StatCard icon={CreditCard} label="Текущий долг" value="4 250 000 ₽" />
          <StatCard icon={Wallet} label="Доступно" value="10 750 000 ₽" />
          <StatCard icon={Calendar} label="След. платёж" value="156 800 ₽" />
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto">
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
            Обзор
          </TabButton>
          <TabButton active={tab === "loans"} onClick={() => setTab("loans")}>
            Мои займы
          </TabButton>
          <TabButton active={tab === "documents"} onClick={() => setTab("documents")}>
            Документы
          </TabButton>
        </div>

        {tab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lux-card rounded-2xl p-7">
              <h3 className="display text-lg mb-5">Активные транши</h3>
              <div className="space-y-4">
                {tranches.map((tranche) => (
                  <div key={tranche.id} className="rounded-xl border border-white/10 p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="display">{tranche.id}</p>
                        <p className="text-sm text-[#9b9a97]">
                          {tranche.amount} • {tranche.rate}
                        </p>
                      </div>
                      <StatusBadge status="Активный" />
                    </div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-[#9b9a97]">Погашено</span>
                      <span>{tranche.paid}%</span>
                    </div>
                    <Progress value={tranche.paid} className="h-2" />
                    <p className="mt-2.5 text-xs text-[#6f6e6b]">Срок до: {tranche.due}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lux-card rounded-2xl p-7">
              <h3 className="display text-lg mb-5">График платежей</h3>
              <div className="space-y-3">
                {paymentSchedule.map((payment, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-3">
                      {payment.status === "paid" ? (
                        <CheckCircle2 size={16} className="text-[#e2b64f]" />
                      ) : (
                        <Calendar size={16} className="text-[#9b9a97]" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{payment.date}</p>
                        <p className="text-xs text-[#6f6e6b]">
                          {payment.status === "paid" ? "Оплачено" : "Предстоящий"}
                        </p>
                      </div>
                    </div>
                    <p className="display">{payment.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lux-card rounded-2xl p-7 lg:col-span-2">
              <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                <div>
                  <h3 className="display text-lg mb-1">Запросить новый транш</h3>
                  <p className="text-sm text-[#9b9a97]">
                    Доступно: 10 750 000 ₽ в рамках одобренного лимита
                  </p>
                </div>
                <button className="btn-gold h-12 px-8 text-sm">Запросить транш</button>
              </div>
            </div>
          </div>
        )}

        {tab === "loans" && (
          <div className="lux-card rounded-2xl p-7">
            <h3 className="display text-lg mb-5">История займов</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 text-left font-medium text-[#9b9a97]">ID</th>
                    <th className="py-3 text-right font-medium text-[#9b9a97]">Сумма</th>
                    <th className="py-3 text-right font-medium text-[#9b9a97]">Ставка</th>
                    <th className="py-3 text-right font-medium text-[#9b9a97]">Дата</th>
                    <th className="py-3 text-right font-medium text-[#9b9a97]">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {loanHistory.map((loan) => (
                    <tr key={loan.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3 font-medium">{loan.id}</td>
                      <td className="py-3 text-right">{loan.amount}</td>
                      <td className="py-3 text-right font-medium text-[#e2b64f]">{loan.rate}</td>
                      <td className="py-3 text-right">{loan.date}</td>
                      <td className="py-3 text-right">
                        <StatusBadge status={loan.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "documents" && (
          <div className="lux-card rounded-2xl p-7">
            <h3 className="display text-lg mb-5">Документы</h3>
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/10 p-4 transition-colors hover:border-[#e2b64f]/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#9b9a97]" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-[#6f6e6b]">
                        {doc.date} • {doc.type}
                      </p>
                    </div>
                  </div>
                  <button className="btn-ghost h-9 px-4 text-xs">Скачать</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
