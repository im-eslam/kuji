import { Button } from "react-aria-components";
import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

export function LanguagePill() {
  const locale = useLocale();
  const t = useStrings(strings);
  return (
    <Button
      aria-label={t.a11yLanguage}
      onPress={() => setLocale(locale === "en" ? "ar" : "en")}
      className="flex h-12 shrink-0 items-center"
    >
      <span dir="ltr" className="flex h-10 items-center gap-1 rounded-full border border-arctic px-3 text-small">
        <span lang="en" className={locale === "en" ? "font-bold" : "font-medium text-navy/65"}>
          EN
        </span>
        <span aria-hidden="true" className="text-navy/65">
          |
        </span>
        <span lang="ar" className={locale === "ar" ? "font-bold" : "font-medium text-navy/65"}>
          ع
        </span>
      </span>
    </Button>
  );
}
