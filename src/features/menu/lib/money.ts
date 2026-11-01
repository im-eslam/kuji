import { useLocale, type Locale } from "@/shared/i18n";

export function formatMoney(value: number, locale: Locale, opts?: { plus?: boolean }): string {
  const amount = Math.round(value);
  const sign = opts?.plus ? "+" : "";
  return locale === "ar" ? `${sign}${amount} ج.م` : `${sign}EGP ${amount}`;
}

export function useMoney() {
  const locale = useLocale();
  return (value: number, opts?: { plus?: boolean }) => formatMoney(value, locale, opts);
}
