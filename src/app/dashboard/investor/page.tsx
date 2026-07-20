"use client";

import { useState } from "react";
import { Building2, Calendar, LineChart, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth-context";
import { DashboardShell, StatCard, StatusBadge, TabButton } from "@/components/dashboard-shell";

const investments = [
  { id: 1, company: "ООО «ТехноПром»", amount: 150_000, rate: 22.5, term: "12 мес", status: "Активный" },
  { id: 2, company: "ООО «СтройМаркет»", amount: 80_000, rate: 19.8, term: "24 мес", status: "Активный" },
  { id: 3, company: "АО «ЛогистикПлюс»", amount: 200_000, rate: 21, term: "18 мес", status: "Активный" },
  { id: 4, company: "ООО «ФудСервис»", amount: 50_000, rate: 24.2, term: "6 мес", status: "Завершён" },
];

const upcomingPayouts = [
  { date: "15 апр", amount: "12 500 ₽", company: "ООО «ТехноПром»" },
  { date: "22 апр", amount: "5 800 ₽", company: "ООО «СтройМаркет»" },
  { date: "01 май", amount: "15 200 ₽", company: "АО «ЛогистикПлюс»" },
];

const availableLoans = [
  { company: "ООО «МедТех»", amount: "5 000 000 ₽", rate: "20.1%", term: "12 мес", filled: 67 },
  { company: "ООО «АгроСнаб»", amount: "3 200 000 ₽", rate: "22.8%", term: "18 мес", filled: 45 },
  { company: "АО «ДигиталПро»", amount: "8 000 000 ₽", rate: "18.5%", term: "24 мес", filled: 82 },
  { company: "ООО «ЭкоПак»", amount: "1 500 000 ₽", rate: "24.0%", term: "6 мес", filled: 23 },
];

export default function InvestorDashboardPage() {
  const [tab, setTab] = useState<"overview" | "portfolio" | "available">("overview");
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const avgRate = (
    investments.reduce((sum, inv) => sum + inv.rate, 0) / investments.length
  ).toFixed(1);

  return (
    <ProtectedRoute>
      <DashboardShell title="Личный кабинет инвестора">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Баланс" value="124 500 ₽" />
          <StatCard
            icon={PiggyBank}
            label="Инвестировано"
            value={`${totalInvested.toLocaleString("ru-RU")} ₽`}
          />
          <StatCard icon={LineChart} label="Средняя ставка" value={`${avgRate}%`} />
          <StatCard icon={TrendingUp} label="Доход за месяц" value="8 240 ₽" />
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto">
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
            Обзор
          </TabButton>
          <TabButton active={tab === "portfolio"} onClick={() => setTab("portfolio")}>
            Портфель
          </TabButton>
          <TabButton active={tab === "available"} onClick={() => setTab("available")}>
            Доступные займы
          </TabButton>
        </div>

        {tab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lux-card rounded-2xl p-7">
              <h3 className="display text-lg mb-5">Последние инвестиции</h3>
              <div className="space-y-3">
                {investments.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <div>
                      <p className="text-sm font-medium">{inv.company}</p>
                      <p className="text-sm text-[#a5a4a0]">
                        {inv.term} • {inv.rate}%
                      </p>
                    </div>
                    <p className="display">{inv.amount.toLocaleString("ru-RU")} ₽</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lux-card rounded-2xl p-7">
              <h3 className="display text-lg mb-5">Ближайшие выплаты</h3>
              <div className="space-y-3">
                {upcomingPayouts.map((payout, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-[#c6c5c1]" />
                      <div>
                        <p className="text-sm font-medium">{payout.company}</p>
                        <p className="text-sm text-[#a5a4a0]">{payout.date}</p>
                      </div>
                    </div>
                    <p className="display text-gold">{payout.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "portfolio" && (
          <div className="lux-card rounded-2xl p-7">
            <h3 className="display text-lg mb-5">Мой портфель</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 text-left font-medium text-[#c6c5c1]">Компания</th>
                    <th className="py-3 text-right font-medium text-[#c6c5c1]">Сумма</th>
                    <th className="py-3 text-right font-medium text-[#c6c5c1]">Ставка</th>
                    <th className="py-3 text-right font-medium text-[#c6c5c1]">Срок</th>
                    <th className="py-3 text-right font-medium text-[#c6c5c1]">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3 font-medium">{inv.company}</td>
                      <td className="py-3 text-right">
                        {inv.amount.toLocaleString("ru-RU")} ₽
                      </td>
                      <td className="py-3 text-right font-medium text-[#e2b64f]">{inv.rate}%</td>
                      <td className="py-3 text-right">{inv.term}</td>
                      <td className="py-3 text-right">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "available" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableLoans.map((loan, i) => (
              <div key={i} className="lux-card reflect rounded-2xl p-6">
                <div className="mb-4 flex items-start justify-between">
                  <p className="display">{loan.company}</p>
                  <Building2 size={16} className="text-[#c6c5c1]" />
                </div>
                <div className="mb-5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#c6c5c1]">Сумма</span>
                    <span className="font-medium">{loan.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#c6c5c1]">Ставка</span>
                    <span className="font-medium text-[#e2b64f]">{loan.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#c6c5c1]">Срок</span>
                    <span className="font-medium">{loan.term}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-[#c6c5c1]">Собрано</span>
                    <span>{loan.filled}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#b8892b] to-[#f0cd7a] transition-all"
                      style={{ width: `${loan.filled}%` }}
                    />
                  </div>
                </div>
                <button className="btn-gold h-10 w-full text-sm">Инвестировать</button>
              </div>
            ))}
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
