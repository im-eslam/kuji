import { lazy, Suspense } from "react";
import { I18nProvider, Link, RouterProvider } from "react-aria-components";
import { LandingPage } from "@/features/landing/LandingPage";
import { ReviewPage } from "@/features/review/ReviewPage";
import { MenuPage } from "@/features/menu/MenuPage";
import { useLocale, type Locale } from "@/shared/i18n";
import { navigate, usePath } from "@/shared/router";
import { ROUTES } from "@/shared/routes";

const AdminPage = lazy(() =>
  import("@/features/admin/AdminPage").then((module) => ({
    default: module.AdminPage,
  })),
);

function NotFoundPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-mist px-6 text-center">
      <h1 className="text-title font-bold">
        {isArabic ? "الصفحة غير موجودة" : "Page not found"}
      </h1>
      <Link
        href={ROUTES.landing}
        className="text-small rounded-full bg-navy px-6 py-3 font-bold text-white transition data-hovered:bg-navy/90"
      >
        {isArabic ? "العودة إلى الرئيسية" : "Back to home"}
      </Link>
    </main>
  );
}

export default function App() {
  const locale = useLocale();
  const path = usePath();
  const isAdmin = path === ROUTES.admin || path.startsWith(`${ROUTES.admin}/`);
  const isLandingExperience = path === ROUTES.landing || path === ROUTES.review;

  return (
    <I18nProvider locale={locale}>
      <RouterProvider navigate={navigate}>
        {isAdmin ? (
          <Suspense fallback={<div className="min-h-dvh bg-mist" />}>
            <AdminPage />
          </Suspense>
        ) : path === ROUTES.menu ? (
          <MenuPage />
        ) : isLandingExperience ? (
          <>
            <LandingPage />
            <ReviewPage />
          </>
        ) : (
          <NotFoundPage locale={locale} />
        )}
      </RouterProvider>
    </I18nProvider>
  );
}
