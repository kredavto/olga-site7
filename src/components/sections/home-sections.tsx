"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Banknote,
  BadgePercent,
  CarFront,
  FileText,
  Handshake,
  ShieldCheck,
  Sparkles,
  Timer,
  Undo2,
} from "lucide-react";
import { LoanCalculator, InvestorCalculator } from "./calculators";
import { CountUp, Magnetic, Reveal, TiltCard, WordReveal } from "@/components/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ==================================================================== */
/* HERO — full-screen cinematic composition with layered parallax        */
/* ==================================================================== */
export function Hero() {
  const [phone, setPhone] = useState("+7 ");
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const carY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "48%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const submit = () =>
    router.push(`/register?role=borrower${phone ? `&phone=${encodeURIComponent(phone)}` : ""}`);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28"
    >
      {/* layered background: grid, orbs, sweeping headlight */}
      <div className="absolute inset-0 grid-lines opacity-60" aria-hidden />
      <motion.div style={{ y: glowY }} className="absolute inset-0" aria-hidden>
        <div className="orb -top-32 -left-32 h-[34rem] w-[34rem] bg-[#e2b64f]/[0.06]" />
        <div className="orb top-1/3 -right-40 h-[40rem] w-[40rem] bg-[#e2b64f]/[0.045]" style={{ animationDelay: "-8s" }} />
      </motion.div>
      <div className="light-sweep" aria-hidden />

      {/* cinematic car silhouette layer */}
      <motion.div
        style={{ y: carY, opacity: fade }}
        className="pointer-events-none absolute bottom-0 left-1/2 w-[140%] max-w-none -translate-x-1/2 lg:w-[90%]"
        aria-hidden
      >
        <CarSilhouette />
      </motion.div>

      <div className="container relative grid items-start gap-14 lg:grid-cols-2 lg:gap-10">
        <motion.div style={{ y: textY }}>
          <Reveal delay={1.3} y={16}>
            <p className="eyebrow mb-8 flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-[#e2b64f]/60" />
              Деньги без ожидания. Автомобиль остаётся вашим
            </p>
          </Reveal>

          <h1 className="display text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.2rem] mb-8">
            <WordReveal text="«ФИНДРАЙВ»" delay={1.45} wordClassName="gold-shimmer" className="uppercase tracking-wide block" />
            <WordReveal text="займы под залог автомобиля" delay={1.6} className="block" />
          </h1>

          <Reveal delay={1.9} y={20}>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-[#c6c5c1]">
              Получите деньги под залог автомобиля со ставкой от 6% в месяц. Авто остаётся у
              вас, ПТС не забираем. Предварительное решение за 10 минут онлайн.
            </p>
          </Reveal>

          <Reveal delay={2.05} y={20}>
            <div className="mb-10 flex flex-col gap-3 sm:flex-row">
              <input
                placeholder="Ваш телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="lux-input max-w-xs"
                type="tel"
              />
              <Magnetic strength={0.18}>
                <button onClick={submit} className="btn-gold glow-pulse h-[3.25rem] px-8 text-base">
                  Подать заявку
                </button>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={2.2} y={16}>
            <button
              onClick={() => router.push("/projects")}
              className="group flex items-center gap-3 text-[1.05rem] text-[#c6c5c1] transition-colors duration-300 hover:text-[#f0cd7a]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e2b64f]/40 bg-[#e2b64f]/10 font-bold text-[#e2b64f] transition-all duration-300 group-hover:shadow-[0_0_18px_rgba(226,182,79,0.4)]">
                ₽
              </span>
              <span>Работаем по СПБ и Ленинградской области</span>
            </button>
          </Reveal>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 48, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:-mt-10"
        >
          <LoanCalculator id="calculator" />
        </motion.div>
      </div>
    </section>
  );
}

/** Abstract premium car body line-work — pure SVG, no external assets. */
function CarSilhouette() {
  return (
    <svg viewBox="0 0 1200 320" fill="none" className="w-full opacity-[0.5]">
      <defs>
        <linearGradient id="carline" x1="0" y1="160" x2="1200" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e2b64f" stopOpacity="0" />
          <stop offset="0.25" stopColor="#e2b64f" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#f0cd7a" stopOpacity="0.9" />
          <stop offset="0.75" stopColor="#e2b64f" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e2b64f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="carfade" x1="600" y1="80" x2="600" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0c0c0e" stopOpacity="0.9" />
          <stop offset="1" stopColor="#060607" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M120 250 C 240 246, 300 200, 400 172 C 520 138, 640 128, 760 140 C 880 152, 980 190, 1060 242"
        stroke="url(#carline)"
        strokeWidth="1.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M330 196 C 420 158, 540 146, 660 152 C 760 158, 850 180, 900 208"
        stroke="url(#carline)"
        strokeWidth="1"
        opacity="0.6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.6, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* wheels */}
      <motion.circle
        cx="380" cy="252" r="42" stroke="url(#carline)" strokeWidth="1.4"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 1.2, delay: 2.4 }}
      />
      <motion.circle
        cx="860" cy="252" r="42" stroke="url(#carline)" strokeWidth="1.4"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 1.2, delay: 2.55 }}
      />
      <rect width="1200" height="320" fill="url(#carfade)" />
    </svg>
  );
}

/* ==================================================================== */
/* FEATURES — «Основные условия»                                         */
/* ==================================================================== */
const FEATURES = [
  { icon: Banknote, title: "Сумма займа", value: "до 5 млн ₽", desc: "В зависимости от стоимости автомобиля" },
  { icon: CarFront, title: "Авто остаётся у вас", value: "ПТС не забираем", desc: "Продолжайте пользоваться машиной" },
  { icon: Timer, title: "Моментальное решение", value: "10 минут", desc: "Предварительное решение онлайн" },
  { icon: BadgePercent, title: "Низкая ставка", value: "от 6%/мес", desc: "Выгоднее, чем в большинстве МФО" },
  { icon: FileText, title: "Минимум документов", value: "3 документа", desc: "Паспорт, ПТС, СТС — больше ничего не нужно" },
  { icon: Undo2, title: "Досрочное погашение", value: "Без штрафов", desc: "Закрывайте заём в любой момент" },
];

export function Features() {
  const router = useRouter();
  return (
    <section id="features" className="scroll-mt-28 relative py-28 lg:py-36 bg-[#0a0a0c]">
      <div className="pointer-events-none absolute inset-x-0 top-0 hairline" aria-hidden />
      <div className="container">
        <Reveal className="mb-16 text-center">
          <p className="eyebrow mb-4">Заёмщикам</p>
          <WordReveal as="h2" text="Основные условия" className="display text-4xl lg:text-5xl" />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <TiltCard max={5} className="rounded-2xl h-full">
                <button
                  type="button"
                  onClick={() => router.push("/register?role=borrower")}
                  className="lux-card reflect group block h-full w-full rounded-2xl p-8 text-left cursor-pointer"
                >
                  <f.icon
                    size={30}
                    className="mb-6 text-[#e2b64f] drop-shadow-[0_0_10px_rgba(226,182,79,0.6)] transition-transform duration-500 group-hover:scale-110"
                  />
                  <p className="mb-1 text-[1.05rem] text-[#c6c5c1]">{f.title}</p>
                  <p className="display mb-3 text-2xl lg:text-[1.7rem] text-gold">{f.value}</p>
                  <p className="text-[1.05rem] leading-relaxed text-[#c6c5c1]">{f.desc}</p>
                </button>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================================================================== */
/* STATS — «ФИНДРАЙВ» в цифрах, animated counters                        */
/* ==================================================================== */
const STATS = [
  { value: "1,2 млрд ₽", label: "Выдано займов под залог авто" },
  { value: "3 520", label: "Автомобилей принято в залог" },
  { value: "60 минут", label: "Среднее время выдачи денег" },
  { value: "97%", label: "Заявок получают одобрение" },
  { value: "5 млн ₽", label: "Максимальная сумма займа" },
  { value: "6%", label: "Минимальная ставка в месяц" },
];

export function Stats() {
  const router = useRouter();
  return (
    <section id="stats" className="scroll-mt-28 relative overflow-hidden py-28 lg:py-36">
      <div className="orb top-10 left-1/3 h-[30rem] w-[30rem] bg-[#e2b64f]/[0.04]" aria-hidden />
      <div className="container relative">
        <Reveal className="mb-20 text-center">
          <p className="eyebrow mb-4">Доверие в цифрах</p>
          <WordReveal as="h2" text="«ФИНДРАЙВ» в цифрах" className="display text-4xl lg:text-5xl" />
        </Reveal>

        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => router.push("/register?role=borrower")}
                className="group w-full cursor-pointer text-center transition-transform duration-500 hover:-translate-y-1.5"
              >
                <p className="display mb-3 text-5xl lg:text-6xl gold-text-gradient drop-shadow-[0_0_28px_rgba(226,182,79,0.25)]">
                  <CountUp value={s.value} />
                </p>
                <div className="mx-auto mb-3 h-px w-10 bg-[#e2b64f]/30 transition-all duration-500 group-hover:w-20 group-hover:bg-[#e2b64f]/60" />
                <p className="text-[1.05rem] text-[#c6c5c1]">{s.label}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================================================================== */
/* INVEST — «Условия для инвестирования»                                 */
/* ==================================================================== */
export function InvestSection() {
  return (
    <section id="invest" className="scroll-mt-28 relative py-16 lg:py-20 bg-[#0a0a0c]">
      <div className="pointer-events-none absolute inset-x-0 top-0 hairline" aria-hidden />
      <div className="container max-w-3xl">
        <Reveal className="mb-4 text-center">
          <p className="eyebrow mb-3 flex items-center justify-center gap-3">
            <Sparkles size={14} /> Капиталу — работу
          </p>
          <WordReveal as="h2" text="Условия для инвестирования" className="display text-3xl lg:text-4xl" />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mb-7 max-w-2xl text-center text-lg leading-relaxed text-[#c6c5c1]">
            Привлекаем инвестиции под{" "}
            <span className="display text-gold">24% годовых</span> с ежемесячной выплатой
            процентов.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <InvestorCalculator />
        </Reveal>
      </div>
    </section>
  );
}

/* ==================================================================== */
/* REQUIREMENTS — «Условия выдачи займа»                                 */
/* ==================================================================== */
const REQUIREMENTS = [
  { label: "Кому выдаём", value: "Гражданам РФ от 18 лет" },
  { label: "Что принимаем в залог", value: "Легковые авто, не старше 20 лет" },
  { label: "Документы", value: "Паспорт, ПТС, СТС" },
  { label: "Состояние авто", value: "На ходу, без серьёзных повреждений" },
  { label: "Регистрация авто", value: "Любой регион РФ" },
  { label: "Кредитная история", value: "Не имеет значения" },
];

export function Requirements() {
  const router = useRouter();
  return (
    <section id="requirements" className="scroll-mt-28 relative py-28 lg:py-36">
      <div className="container max-w-5xl">
        <Reveal className="mb-16 text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <ShieldCheck size={14} /> Прозрачные требования
          </p>
          <WordReveal as="h2" text="Условия выдачи займа" className="display text-4xl lg:text-5xl" />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {REQUIREMENTS.map((r, i) => (
            <Reveal key={r.label} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => router.push("/register?role=borrower")}
                className="lux-card reflect group flex w-full items-center justify-between gap-6 rounded-2xl p-6 lg:p-7 text-left cursor-pointer"
              >
                <div>
                  <p className="mb-1.5 text-[1.05rem] uppercase tracking-[0.12em] text-[#a5a4a0]">
                    {r.label}
                  </p>
                  <p className="display text-lg lg:text-xl text-[#f4f2ee] transition-colors duration-300 group-hover:text-[#f0cd7a]">
                    {r.value}
                  </p>
                </div>
                <span className="text-[#e2b64f]/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-[#e2b64f]">
                  →
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================================================================== */
/* PARTNERS — «Партнёрская программа»                                    */
/* ==================================================================== */
export function Partners() {
  const router = useRouter();
  return (
    <section id="partners" className="scroll-mt-28 relative py-28 lg:py-36 bg-[#0a0a0c]">
      <div className="pointer-events-none absolute inset-x-0 top-0 hairline" aria-hidden />
      <div className="container max-w-4xl">
        <Reveal className="mb-16 text-center">
          <p className="eyebrow mb-4">Совместный рост</p>
          <WordReveal as="h2" text="Партнёрская программа" className="display text-4xl lg:text-5xl" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-strong reflect relative overflow-hidden rounded-3xl p-8 lg:p-12">
            <div className="orb -right-24 -top-24 h-72 w-72 bg-[#e2b64f]/[0.07]" aria-hidden />
            <div className="relative">
              <div className="mb-8 flex items-start gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#e2b64f]/30 bg-[#e2b64f]/10 text-[#e2b64f] shadow-[0_0_24px_rgba(226,182,79,0.2)]">
                  <Handshake size={26} />
                </span>
                <p className="text-lg lg:text-xl leading-relaxed text-[#d6d5d1]">
                  Стань участником нашей партнёрской программы и зарабатывай вместе с нами на
                  постоянной основе!
                </p>
              </div>

              <div className="hairline mb-8" />

              <div className="mb-10 flex items-start gap-4">
                <BadgePercent size={24} className="mt-1 shrink-0 text-[#e2b64f]" />
                <p className="text-lg lg:text-xl leading-relaxed">
                  <span className="text-[#c6c5c1]">Наши условия — </span>
                  <span className="display text-gold">платим 5%</span>
                  <span className="text-[#c6c5c1]">
                    {" "}
                    от сделки за каждого привлечённого вами инвестора или заёмщика. Работаем
                    официально в рамках Агентского договора.
                  </span>
                </p>
              </div>

              <Magnetic strength={0.15}>
                <button
                  onClick={() => router.push("/register?role=partner")}
                  className="btn-gold glow-pulse h-14 px-10 text-base"
                >
                  Стать партнёром
                </button>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ==================================================================== */
/* FAQ — «Часто задаваемые вопросы»                                      */
/* ==================================================================== */
const FAQ_ITEMS = [
  {
    q: "Как получить заём под залог автомобиля?",
    a: "Всё просто: 1) Оставьте онлайн-заявку с телефоном. 2) Эксперт оценит автомобиль за 10 минут. 3) Подпишите договор. 4) Получите деньги на карту — обычно в течение часа. Автомобиль остаётся у вас.",
  },
  {
    q: "Заберёте ли вы мой автомобиль или ПТС?",
    a: "Нет. Вы продолжаете пользоваться автомобилем как обычно. ПТС остаётся у вас — мы оформляем залог, не изымая транспортное средство.",
  },
  {
    q: "Какая процентная ставка по займу?",
    a: "Ставка начинается от 6% в месяц и зависит от суммы, срока и состояния автомобиля. Досрочное погашение — без штрафов и переплат.",
  },
  {
    q: "Какую максимальную сумму можно получить?",
    a: "До 5 000 000 ₽ — итоговая сумма зависит от рыночной стоимости и состояния вашего автомобиля по результатам оценки.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-28 relative py-28 lg:py-36">
      <div className="container max-w-3xl">
        <Reveal className="mb-16 text-center">
          <p className="eyebrow mb-4">О компании</p>
          <WordReveal as="h2" text="Часто задаваемые вопросы" className="display text-4xl lg:text-5xl" />
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="lux-card rounded-2xl px-7 data-[state=open]:border-[#e2b64f]/30"
              >
                <AccordionTrigger className="display text-lg lg:text-xl">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-base lg:text-lg leading-relaxed text-[#c6c5c1]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
