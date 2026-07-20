"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileText, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";

export const DOCUMENTS = [
  { label: "Анкета заёмщика", href: "/documents/anketa-zaemshchika.docx" },
  { label: "Заявление о предоставлении займа", href: "/documents/zayavlenie-na-zaym.docx" },
  { label: "Договор займа", href: "/documents/dogovor-zayma.docx" },
  { label: "Договор залога", href: "/documents/dogovor-zaloga.docx" },
  { label: "Согласие на раскрытие кредитной истории", href: "/documents/soglasie-kreditnaya-istoriya.docx" },
  { label: "Согласие на обработку персональных данных", href: "/documents/soglasie-obrabotka-pdn.docx" },
  { label: "Положение о порядке обработки и защиты персональных данных", href: "/documents/polozhenie-o-pdn.docx" },
  { label: "Карта партнёра ООО МКК «ФИНДРАЙВ»", href: "/documents/karta-partnera.docx" },
  { label: "Правила предоставления займов", href: "/documents/pravila-predostavleniya-zaymov.docx" },
  { label: "Выписка из реестра МФО ЦБ РФ", href: "/documents/document-1.pdf" },
  { label: "ИНН ООО МКК «ФИНДРАЙВ»", href: "/documents/document-2.pdf" },
  { label: "СберРейтинг", href: "/documents/document-3.pdf" },
  { label: "Сведения об изменении фирменного наименования", href: "/documents/document-4.pdf" },
  { label: "Свидетельство СРО «МИР»", href: "/documents/document-5.pdf" },
  { label: "ССЫЛКИ ПАРТНЕРОВ", href: "/documents/ukazanie-cb-ssylki-2.docx" },
  { label: "Уведомление клиентам о смене наименования", href: "/documents/rekvizity-dlya-kontragentov.docx" },
  { label: "Структура собственности", href: "/documents/document-6.pdf" },
  { label: "Устав ООО МКК «ГосАвтоФинанс»", href: "/documents/document-7.pdf" },
  { label: "Выписка из ЕГРЮЛ", href: "/documents/vypiska-egrul.pdf" },
  { label: "Устав ООО МКК «ГосАвтоФинанс» (скан)", href: "/documents/ustav-gosavtofinans.tif" },
];

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const [docsOpen, setDocsOpen] = useState(false);

  const scrollTo = (id: string) => {
    if (pathname !== "/") {
      router.push("/#" + id);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#050506] pt-24 pb-12">
      {/* ambient */}
      <div className="orb -bottom-40 left-1/4 h-96 w-96 bg-[#e2b64f]/[0.045]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 hairline" aria-hidden />

      <div className="container relative grid grid-cols-1 gap-14 md:grid-cols-4">
        <div>
          <div className="mb-6">
            <Logo size="md" />
          </div>
          <p className="text-[1.05rem] leading-relaxed text-[#c6c5c1]">
            ООО МКК «ФИНДРАЙВ» — быстрые займы под залог автомобилей. Деньги за час, авто
            остаётся у вас.
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-6">Заёмщикам</h4>
          <ul className="space-y-3 text-[1.05rem] text-[#c6c5c1]">
            <li>
              <button onClick={() => scrollTo("features")} className="transition-colors duration-300 hover:text-[#f0cd7a]">
                Займы под залог авто
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo("requirements")} className="transition-colors duration-300 hover:text-[#f0cd7a]">
                Условия
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo("calculator")} className="transition-colors duration-300 hover:text-[#f0cd7a]">
                Калькулятор
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-6">О компании</h4>
          <ul className="space-y-3 text-[1.05rem] text-[#c6c5c1]">
            <li>
              <button onClick={() => router.push("/register?role=borrower")} className="transition-colors duration-300 hover:text-[#f0cd7a]">
                Подать заявку
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo("stats")} className="transition-colors duration-300 hover:text-[#f0cd7a]">
                «ФИНДРАЙВ» в цифрах
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo("faq")} className="transition-colors duration-300 hover:text-[#f0cd7a]">
                Вопросы и ответы
              </button>
            </li>
            <li>
              <button
                onClick={() => setDocsOpen((v) => !v)}
                className="flex items-center gap-2 transition-colors duration-300 hover:text-[#f0cd7a]"
              >
                Документы
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-500 ${docsOpen ? "rotate-180 text-[#e2b64f]" : ""}`}
                />
              </button>
              <AnimatePresence>
                {docsOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-3 ml-1 space-y-2 overflow-hidden border-l border-[#e2b64f]/20 pl-4"
                  >
                    {DOCUMENTS.map((doc) => (
                      <li key={doc.href}>
                        <a
                          href={doc.href}
                          download
                          className="flex items-start gap-2 text-[1.05rem] leading-snug transition-colors duration-300 hover:text-[#f0cd7a]"
                        >
                          <FileText size={13} className="mt-0.5 shrink-0 text-[#e2b64f]/60" />
                          {doc.label}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-6">Контакты</h4>
          <ul className="space-y-3 text-[1.05rem] text-[#c6c5c1]">
            <li>
              <a href="mailto:findrive78@yandex.ru" className="flex items-center gap-2.5 transition-colors duration-300 hover:text-[#f0cd7a]">
                <Mail size={15} className="text-[#e2b64f]/70" />
                findrive78@yandex.ru
              </a>
            </li>
            <li>
              <a href="tel:+79219888880" className="flex items-center gap-2.5 transition-colors duration-300 hover:text-[#f0cd7a]">
                <Phone size={15} className="text-[#e2b64f]/70" />
                8 (921) 988-88-80
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-1 shrink-0 text-[#e2b64f]/70" />
              Санкт-Петербург, улица Салова, дом 70А, офис 310
            </li>
          </ul>
        </div>
      </div>

      {/* регуляторная информация и QR-коды */}
      <div className="container relative mt-16 border-t border-white/[0.05] pt-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              qr: "/qr-cbr.svg",
              label: "Интернет приемная ЦБ РФ:",
              href: "https://www.cbr.ru/reception",
              text: "https://www.cbr.ru/reception",
            },
            {
              qr: "/qr-finombudsman.svg",
              label: "Сайт финансового уполномоченного:",
              href: "https://finombudsman.ru",
              text: "https://finombudsman.ru",
            },
            {
              qr: "/qr-sromir.svg",
              label: "Сайт СРО \u00abМир\u00bb:",
              href: "https://doc.sromir.ru/obrashchenie_v_sro_mir",
              text: "https://doc.sromir.ru/obrashchenie_v_sro_mir",
            },
          ].map((item) => (
            <div key={item.href} className="flex items-center gap-4">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl bg-white p-1.5 transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(226,182,79,0.35)]"
                aria-label={item.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.qr} alt={item.label} className="h-20 w-20" />
              </a>
              <div className="min-w-0">
                <p className="text-sm text-[#c6c5c1]">{item.label}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-[#e2b64f] underline underline-offset-2 transition-colors hover:text-[#f0cd7a]"
                >
                  {item.text}
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm leading-relaxed text-[#a5a4a0]">
          Общество с ограниченной ответственностью Микрокредитная компания «ФИНДРАЙВ».
          ОГРН 1217800146024. ИНН 7816722290. Регистрационный номер в государственном
          реестре МФО 2203140009792. ООО МКК «ФИНДРАЙВ» является членом СРО «МиР» —
          Регистрационный Номер 78001270.
        </p>
      </div>

      <div className="container relative mt-10 border-t border-white/[0.05] pt-8 text-center text-sm text-[#a5a4a0]">
        © 2026 ООО МКК «ФИНДРАЙВ». Все права защищены.
      </div>
    </footer>
  );
}
