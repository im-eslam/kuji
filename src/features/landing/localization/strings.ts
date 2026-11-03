import type { Localized } from "@/shared/i18n";

const en = {
  taglineLead: "Romanticize your",
  taglineEmphasis: "coffee.",
  footerLead: "Brewed for souls that feel",
  footerEmphasis: "too much.",
  languageName: "عربي",
  switchToLanguage: "Switch to Arabic",
  menuTitle: "Menu",
  menuHint: "Drinks, desserts & offers",
  reviewTitle: "Rate us",
  reviewHint: "Tell us how it went",
  followUs: "Follow us",
  findUs: "Find us",
  newTab: "(opens in a new tab)",
  branchNames: {
    algamaa: "Hai Algama'a Branch",
    teraa: "Al Tera'a St. Branch",
  },
};

const ar: typeof en = {
  taglineLead: "اجعل قهوتك",
  taglineEmphasis: "رومانسية.",
  footerLead: "محضّرة لأرواحٍ تشعر",
  footerEmphasis: "بكل شيء.",
  languageName: "English",
  switchToLanguage: "التبديل إلى الإنجليزية",
  menuTitle: "القائمة",
  menuHint: "مشروبات، حلويات وعروض",
  reviewTitle: "قيّم تجربتك",
  reviewHint: "أخبرنا كيف كانت تجربتك",
  followUs: "تابعنا",
  findUs: "مواقعنا",
  newTab: "(يُفتح في تبويب جديد)",
  branchNames: {
    algamaa: "فرع حي الجامعة",
    teraa: "فرع شارع الترعة",
  },
};

export const strings: Localized<typeof en> = { en, ar };
