import type { Localized } from "@/shared/i18n";

const en = {
  brandName: "Kuji",
  adminBadge: "Admin",

  loginTitle: "Admin sign in",
  usernameLabel: "Username",
  passwordLabel: "Password",
  showPassword: "Show password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  errorCredentials: "Incorrect username or password.",
  errorBlocked: "Sign-in isn't allowed from this page. Reload it and try again.",
  errorNetwork: "Can't reach the server. Check your connection and try again.",
  errorServer: "Something went wrong on our side. Please try again shortly.",
  rateLimited: "Too many failed attempts. Please try again later.",
  sessionExpired: "Your session expired. Please sign in again.",
  logoutIncomplete:
    "We couldn't reach the server to end your session. Sign out again once you're back online.",
  checking: "Checking your session…",
  unavailable: "We couldn't check your session. Please try again.",
  retry: "Try again",

  skipToContent: "Skip to content",
  navLabel: "Admin sections",
  logout: "Sign out",
  loggingOut: "Signing out…",
  signedInAs: "Signed in as {name}",
  tabs: {
    reviews: "Reviews",
    menu: "Menu",
    settings: "Settings",
  },
  tabHints: {
    reviews: "Read and manage what your guests tell you.",
    menu: "Keep drinks, desserts and offers up to date.",
    settings: "Language, username and password.",
  },
  comingSoon: "Coming soon",
  notFoundTitle: "Page not found",
  notFoundHint: "This page doesn't exist in the dashboard.",
  notFoundAction: "Back to dashboard",
  errorTitle: "Something went wrong",
  errorHint: "This section couldn't be shown. Try again.",
};

const ar: typeof en = {
  brandName: "Kuji",
  adminBadge: "الإدارة",

  loginTitle: "تسجيل دخول المشرف",
  usernameLabel: "اسم المستخدم",
  passwordLabel: "كلمة المرور",
  showPassword: "إظهار كلمة المرور",
  signIn: "تسجيل الدخول",
  signingIn: "جارٍ تسجيل الدخول…",
  errorCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة.",
  errorBlocked: "لا يمكن تسجيل الدخول من هذه الصفحة. أعد تحميلها وحاول مرة أخرى.",
  errorNetwork: "تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.",
  errorServer: "حدث خطأ من جانبنا. حاول مرة أخرى بعد قليل.",
  rateLimited: "محاولات فاشلة كثيرة. يرجى المحاولة لاحقًا.",
  sessionExpired: "انتهت جلستك. يرجى تسجيل الدخول من جديد.",
  logoutIncomplete:
    "تعذّر الوصول إلى الخادم لإنهاء جلستك. سجّل الخروج مرة أخرى عند عودة الاتصال.",
  checking: "جارٍ التحقق من جلستك…",
  unavailable: "تعذّر التحقق من جلستك. حاول مرة أخرى.",
  retry: "حاول مرة أخرى",

  skipToContent: "انتقل إلى المحتوى",
  navLabel: "أقسام لوحة الإدارة",
  logout: "تسجيل الخروج",
  loggingOut: "جارٍ تسجيل الخروج…",
  signedInAs: "تم الدخول باسم {name}",
  tabs: {
    reviews: "التقييمات",
    menu: "القائمة",
    settings: "الإعدادات",
  },
  tabHints: {
    reviews: "اقرأ ما يكتبه ضيوفك وأدِر التقييمات.",
    menu: "حدّث المشروبات والحلويات والعروض.",
    settings: "اللغة واسم المستخدم وكلمة المرور.",
  },
  comingSoon: "قريبًا",
  notFoundTitle: "الصفحة غير موجودة",
  notFoundHint: "هذه الصفحة غير موجودة في لوحة الإدارة.",
  notFoundAction: "العودة إلى لوحة الإدارة",
  errorTitle: "حدث خطأ ما",
  errorHint: "تعذّر عرض هذا القسم. حاول مرة أخرى.",
};

export const strings: Localized<typeof en> = { en, ar };
