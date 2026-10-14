"use client";

import { Check } from "lucide-react";

export type Consents = {
  personalData: boolean;
  creditReport: boolean;
  marketing: boolean;
};

export const EMPTY_CONSENTS: Consents = {
  personalData: false,
  creditReport: false,
  marketing: false,
};

/** Обязательные согласия для отправки заявки (рассылки — по желанию). */
export const hasRequiredConsents = (c: Consents) => c.personalData && c.creditReport;

export const CONSENTS_ERROR =
  "Отметьте согласие на обработку персональных данных и на получение кредитного отчёта";

const LINK_PD_CONSENT =
  "https://www.consultant.ru/document/cons_doc_LAW_61801/6a03be81a8b9813a48e71be4d852ab74cb2e647b/";
const LINK_PRIVACY = "https://www.consultant.ru/document/cons_doc_LAW_61801/";
const LINK_CREDIT_REPORT =
  "https://www.consultant.ru/document/cons_doc_LAW_51043/40b3cb19717208d277d337d45e412579dfd9e230/";

const linkClass =
  "text-[#e2b64f] underline underline-offset-2 transition-colors hover:text-[#f0cd7a]";

function Box({
  checked,
  onToggle,
  invalid,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-left">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onToggle}
      />
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-[#e2b64f]/60 ${
          checked
            ? "border-[#e2b64f] bg-gradient-to-br from-[#f0cd7a] to-[#b8892b] text-[#0b0a07]"
            : invalid
              ? "border-[#e27a4f] bg-transparent"
              : "border-white/30 bg-transparent"
        }`}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span className="text-[0.92rem] leading-snug text-[#c6c5c1]">{children}</span>
    </label>
  );
}

/**
 * Три согласия перед кнопкой «Подать заявку».
 * `showErrors` подсвечивает пустые обязательные поля после попытки отправки.
 */
export function ConsentChecks({
  value,
  onChange,
  showErrors = false,
  className = "",
}: {
  value: Consents;
  onChange: (next: Consents) => void;
  showErrors?: boolean;
  className?: string;
}) {
  const toggle = (key: keyof Consents) => onChange({ ...value, [key]: !value[key] });
  // клик по ссылке не должен переключать галочку
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className={`space-y-3 ${className}`}>
      <Box
        checked={value.personalData}
        onToggle={() => toggle("personalData")}
        invalid={showErrors && !value.personalData}
      >
        Нажимая кнопку «Подать заявку», я даю{" "}
        <a href={LINK_PD_CONSENT} target="_blank" rel="noopener noreferrer" onClick={stop} className={linkClass}>
          согласие на обработку персональных данных
        </a>{" "}
        и принимаю условия{" "}
        <a href={LINK_PRIVACY} target="_blank" rel="noopener noreferrer" onClick={stop} className={linkClass}>
          Политики конфиденциальности
        </a>
        .
      </Box>
      <Box
        checked={value.creditReport}
        onToggle={() => toggle("creditReport")}
        invalid={showErrors && !value.creditReport}
      >
        Я даю{" "}
        <a href={LINK_CREDIT_REPORT} target="_blank" rel="noopener noreferrer" onClick={stop} className={linkClass}>
          согласие на получение кредитного отчета
        </a>{" "}
        из бюро кредитных историй (БКИ).
      </Box>
      <Box checked={value.marketing} onToggle={() => toggle("marketing")}>
        Я согласен на получение информационных и рекламных рассылок
      </Box>
    </div>
  );
}
