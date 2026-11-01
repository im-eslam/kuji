import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Menu } from "./Menu";
import { strings } from "./localization/strings";
import { useMenu } from "./hooks/useMenu";

/** The /menu page: loads the menu, then shows a loading screen, an error screen, or the menu itself. */
export function MenuPage() {
  const t = useStrings(strings);
  const menu = useMenu();

  if (menu.status === "loading") {
    return (
      <main aria-busy="true" className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center">
        <div aria-hidden="true" className="size-10 animate-spin rounded-full border-2 border-arctic border-t-navy" />
        <p className="text-small font-medium text-navy/65">{t.loadingMenu}</p>
      </main>
    );
  }

  if (menu.status === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="text-title font-bold">{t.errorTitle}</h1>
        <p className="text-small font-medium text-navy/65">{menu.isNetworkError ? t.errorNetwork : t.errorServer}</p>
        <Button onPress={menu.retry} className="text-small rounded-full bg-navy px-6 py-3 font-bold text-white transition data-hovered:bg-navy/90">
          {t.retry}
        </Button>
      </main>
    );
  }

  return <Menu menu={menu.menu} />;
}
