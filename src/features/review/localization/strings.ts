import type { Localized } from "@/shared/i18n";

const en = {
  sheetTitle: "How was it?",
  googleTitle: "Loved it!",
  googleHint: "Share your experience",
  noteTitle: "I have a suggestion",
  noteHint: "Help us improve",
  noteLabel: "How can we make it better?",
  nameLabel: "Name (optional)",
  contactLabel: "Phone or email (optional)",
  tooShort: "Please tell us a bit more.",
  send: "Send Feedback",
  sending: "Sending…",
  error: "Something went wrong. Check your connection and try again.",
  invalidInput: "Please check your message and try again.",
  timeout: "The request took too long. Please try again.",
  serverError: "We couldn't send your feedback right now. Please try again later.",
  tooMany: "You've sent a few messages already. Please try again in a few minutes.",
  thanks: "Thank you! We truly value your thoughts.",
  close: "Close",
};

const ar: typeof en = {
  sheetTitle: "كيف كانت تجربتك؟",
  googleTitle: "كل شيء كان رائعاً!",
  googleHint: "شارك تجربتك",
  noteTitle: "لدي بعض الملاحظات",
  noteHint: "ساعدنا لنقدم لك الأفضل",
  noteLabel: "كيف يمكننا التحسن؟",
  nameLabel: "الاسم (اختياري)",
  contactLabel: "الهاتف أو البريد (اختياري)",
  tooShort: "من فضلك اكتب تفاصيل أكثر قليلاً.",
  send: "إرسال الملاحظات",
  sending: "جارٍ الإرسال…",
  error: "حدث خطأ ما. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
  invalidInput: "يرجى مراجعة الرسالة والبيانات المدخلة ثم المحاولة مرة أخرى.",
  timeout: "استغرق الطلب وقتًا أطول من المتوقع. حاول مرة أخرى.",
  serverError: "تعذر إرسال ملاحظاتك الآن. يرجى المحاولة لاحقًا.",
  tooMany: "أرسلت عدة رسائل بالفعل. حاول مرة أخرى بعد دقائق.",
  thanks: "شكرًا لك! نحن نقدر ملاحظاتك جداً.",
  close: "إغلاق",
};

export const strings: Localized<typeof en> = { en, ar };
