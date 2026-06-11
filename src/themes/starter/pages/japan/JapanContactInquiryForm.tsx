"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/themes/starter/components/ui/Button";

type JapanContactInquiryFormProps = {
  email: string;
  emailSubject: string;
  submitLabel: string;
  consentLabel: string;
  responseNote?: string;
};

type InquiryValues = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  sector: string;
  headcount: string;
  timing: string;
  japaneseLevel: string;
  message: string;
};

const initialValues: InquiryValues = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  sector: "",
  headcount: "",
  timing: "",
  japaneseLevel: "",
  message: "",
};

export function JapanContactInquiryForm({
  email,
  emailSubject,
  submitLabel,
  consentLabel,
  responseNote,
}: JapanContactInquiryFormProps) {
  const [values, setValues] = useState(initialValues);

  function updateValue(key: keyof InquiryValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = [
      "インドネシア人材採用について、下記の内容で相談を希望します。",
      "",
      `会社名：${values.companyName}`,
      `ご担当者名：${values.contactName}`,
      `メールアドレス：${values.email}`,
      `電話番号：${values.phone || "未入力"}`,
      `ご希望の職種・業種：${values.sector || "未入力"}`,
      `採用予定人数：${values.headcount || "未入力"}`,
      `採用希望時期：${values.timing || "未入力"}`,
      `希望する日本語レベル・経験：${values.japaneseLevel || "未入力"}`,
      "",
      "お問い合わせ内容：",
      values.message || "未入力",
    ].join("\n");

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
  }

  const fieldClassName =
    "mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm md:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <ContactField label="会社名" required>
          <input
            required
            value={values.companyName}
            onChange={(event) => updateValue("companyName", event.target.value)}
            className={fieldClassName}
            autoComplete="organization"
          />
        </ContactField>
        <ContactField label="ご担当者名" required>
          <input
            required
            value={values.contactName}
            onChange={(event) => updateValue("contactName", event.target.value)}
            className={fieldClassName}
            autoComplete="name"
          />
        </ContactField>
        <ContactField label="メールアドレス" required>
          <input
            required
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            className={fieldClassName}
            autoComplete="email"
          />
        </ContactField>
        <ContactField label="電話番号">
          <input
            type="tel"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            className={fieldClassName}
            autoComplete="tel"
          />
        </ContactField>
        <ContactField label="ご希望の職種・業種">
          <input
            value={values.sector}
            onChange={(event) => updateValue("sector", event.target.value)}
            className={fieldClassName}
            placeholder="例：飲食料品製造、介護、外食"
          />
        </ContactField>
        <ContactField label="採用予定人数">
          <input
            value={values.headcount}
            onChange={(event) => updateValue("headcount", event.target.value)}
            className={fieldClassName}
            placeholder="例：3名"
          />
        </ContactField>
        <ContactField label="採用希望時期">
          <input
            value={values.timing}
            onChange={(event) => updateValue("timing", event.target.value)}
            className={fieldClassName}
            placeholder="例：2026年10月頃"
          />
        </ContactField>
        <ContactField label="希望する日本語レベル・経験">
          <input
            value={values.japaneseLevel}
            onChange={(event) => updateValue("japaneseLevel", event.target.value)}
            className={fieldClassName}
            placeholder="例：JLPT N4相当、製造経験者"
          />
        </ContactField>
      </div>

      <ContactField label="お問い合わせ内容" className="mt-5">
        <textarea
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          className={`${fieldClassName} min-h-32 resize-y py-3`}
          placeholder="現在の採用課題や確認したい内容をご記入ください。"
        />
      </ContactField>

      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-neutral-600">
        <input required type="checkbox" className="mt-1 size-4 accent-[var(--color-primary)]" />
        <span>{consentLabel}</span>
      </label>

      {responseNote ? (
        <p className="mt-4 text-sm leading-6 text-neutral-500">{responseNote}</p>
      ) : null}

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
        <Mail aria-hidden="true" className="size-4" />
        {submitLabel}
      </Button>
    </form>
  );
}

function ContactField({
  label,
  required = false,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-semibold text-neutral-800">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}
