"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { AnimatedNumber, Magnetic } from "@/components/motion";

const fmt = (n: number) => n.toLocaleString("ru-RU");

/* ------------------------------------------------------------------ */
/* Loan calculator — identical math & ranges, glass luxury UI           */
/* amount 50 000–5 000 000 step 50 000; term 1–12; rate 6–8 step 0.5   */
/* annuity payment, approval 95%                                        */
/* ------------------------------------------------------------------ */
export function LoanCalculator({ className, id }: { className?: string; id?: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState(500_000);
  const [term, setTerm] = useState(12);
  const [rate, setRate] = useState(6);

  const { monthly, probability } = useMemo(() => {
    const r = rate / 100;
    const payment = (amount * r) / (1 - Math.pow(1 + r, -term));
    return { monthly: Math.round(payment), probability: 95 };
  }, [amount, term, rate]);

  return (
    <div id={id} className={`glass-strong reflect rounded-3xl p-8 lg:p-10 ${className ?? ""}`}>
      <p className="eyebrow mb-3">Расчёт онлайн</p>
      <h3 className="display text-2xl lg:text-[1.9rem] mb-8">
        Калькулятор займа под залог авто
      </h3>

      <div className="space-y-7">
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <label className="lux-label mb-0">Желаемая сумма займа</label>
            <p className="display text-2xl lg:text-3xl text-gold whitespace-nowrap">
              <AnimatedNumber value={amount} /> ₽
            </p>
          </div>
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={50_000}
            max={5_000_000}
            step={50_000}
            aria-label="Желаемая сумма займа"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <label className="lux-label mb-0">Желаемый срок займа</label>
            <p className="display text-2xl lg:text-3xl whitespace-nowrap">
              <AnimatedNumber value={term} /> месяцев
            </p>
          </div>
          <Slider
            value={[term]}
            onValueChange={(v) => setTerm(v[0])}
            min={1}
            max={12}
            step={1}
            aria-label="Желаемый срок займа"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <label className="lux-label mb-0">Процентная ставка</label>
            <p className="display text-2xl lg:text-3xl text-gold whitespace-nowrap">
              {rate.toLocaleString("ru-RU")}% в месяц
            </p>
          </div>
          <Slider
            value={[rate]}
            onValueChange={(v) => setRate(v[0])}
            min={6}
            max={8}
            step={0.5}
            aria-label="Процентная ставка"
          />
        </div>

        <div className="hairline" />

        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="lux-label">Ежемесячный платеж</p>
            <p className="display text-3xl lg:text-4xl">
              <AnimatedNumber value={monthly} /> <span className="text-gold">₽</span>
            </p>
          </div>
          <div className="text-right">
            <p className="lux-label">Одобрение</p>
            <p className="display text-3xl lg:text-4xl text-gold">{probability}%</p>
          </div>
        </div>
      </div>

      <Magnetic className="mt-9 block w-full" strength={0.12}>
        <button
          onClick={() => router.push("/register?role=borrower")}
          className="btn-gold glow-pulse h-14 w-full text-base"
        >
          Подать заявку на заём
        </button>
      </Magnetic>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Investor calculator — identical math & ranges                        */
/* amount 1M–10M step 100k; term 1–3 years; fixed 24% годовых          */
/* monthly income = amount * 0.24 / 12                                  */
/* ------------------------------------------------------------------ */
const INVEST_RATE = 0.24;

export function InvestorCalculator() {
  const router = useRouter();
  const [amount, setAmount] = useState(3_000_000);
  const [years, setYears] = useState(1);
  const monthlyIncome = useMemo(() => Math.round((amount * INVEST_RATE) / 12), [amount]);

  return (
    <div className="glass-strong reflect rounded-3xl p-8 lg:p-12">
      <p className="eyebrow mb-3">Инвесторам</p>
      <h3 className="display text-2xl lg:text-3xl mb-9">Калькулятор инвестора</h3>

      <div className="space-y-8">
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <label className="lux-label mb-0">Предлагаемая сумма инвестиций</label>
            <p className="display text-2xl lg:text-4xl text-gold whitespace-nowrap">
              <AnimatedNumber value={amount} /> ₽
            </p>
          </div>
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={1_000_000}
            max={10_000_000}
            step={100_000}
            aria-label="Предлагаемая сумма инвестиций"
          />
          <div className="mt-2 flex justify-between text-sm text-[#a5a4a0]">
            <span>1 млн ₽</span>
            <span>10 млн ₽</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <label className="lux-label mb-0">Срок инвестиций</label>
            <p className="display text-2xl lg:text-4xl whitespace-nowrap">
              {years} {years === 1 ? "год" : "года"}
            </p>
          </div>
          <Slider
            value={[years]}
            onValueChange={(v) => setYears(v[0])}
            min={1}
            max={3}
            step={1}
            aria-label="Срок инвестиций"
          />
          <div className="mt-2 flex justify-between text-sm text-[#a5a4a0]">
            <span>1 год</span>
            <span>3 года</span>
          </div>
        </div>

        <div>
          <label className="lux-label">Процентная ставка</label>
          <p className="display text-2xl lg:text-4xl text-gold">24% годовых</p>
        </div>

        <div className="hairline" />

        <div>
          <p className="lux-label">Ежемесячная доходность</p>
          <p className="display text-4xl lg:text-5xl text-gold drop-shadow-[0_0_24px_rgba(226,182,79,0.35)]">
            <AnimatedNumber value={monthlyIncome} /> ₽
          </p>
        </div>
      </div>

      <Magnetic className="mt-10 block w-full" strength={0.12}>
        <button
          onClick={() => router.push("/register?role=investor")}
          className="btn-gold glow-pulse h-14 w-full text-base"
        >
          Инвестировать
        </button>
      </Magnetic>
    </div>
  );
}
