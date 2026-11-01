import { useMemo } from "react";
import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { MenuHeader } from "./controls/Header";
import { MenuOverlays } from "./controls/Overlays";
import { Popup } from "./controls/Popup";
import { MenuSections } from "./controls/Sections";
import { useMenu } from "./data/useMenu";
import { MenuStateProvider, useMenuState } from "./hooks/useMenuState";
import { useScrollSpy } from "./hooks/useScrollSpy";
import { strings } from "./strings";
import type { MenuDb } from "./types";

// ==== Loading & error states ====

function LoadingSkeleton() {
  const t = useStrings(strings);
  return (
    <main aria-busy="true" className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <div aria-hidden="true" className="size-10 animate-spin rounded-full border-2 border-arctic border-t-navy" />
      <p className="text-small font-medium text-navy/65">{t.loadingMenu}</p>
    </main>
  );
}

function messageForError(code: string | null, t: typeof strings.en): string {
  if (code === "NETWORK_ERROR") return t.errorNetwork;
  if (code === "TIMEOUT") return t.errorTimeout;
  if (code === "INTERNAL_ERROR" || code === "INVALID_RESPONSE") return t.errorServer;
  const status = code ? Number(code) : NaN;
  if (!Number.isNaN(status) && status >= 500) return t.errorServer;
  return t.errorGeneric;
}

function ErrorState({ code, onRetry }: { code: string | null; onRetry: () => void }) {
  const t = useStrings(strings);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <h1 className="text-title font-bold">{t.errorTitle}</h1>
      <p className="text-small font-medium text-navy/65">{messageForError(code, t)}</p>
      <Button
        onPress={onRetry}
        className="text-small rounded-full bg-navy px-6 py-3 font-bold text-white transition data-hovered:bg-navy/90"
      >
        {t.retry}
      </Button>
    </main>
  );
}

// ==== Shell ====

function MenuBody() {
  const { db, announcement } = useMenuState();

  const ids = useMemo(() => {
    const list: string[] = [];
    if (db.signatures.length > 0) list.push("signatures");
    if (db.pairings.length > 0) list.push("pairings");
    for (const category of db.categories) list.push(category.id);
    return list;
  }, [db]);
  const scrollSpy = useScrollSpy(ids);

  return (
    <div className="min-h-dvh bg-white pb-24">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <MenuHeader activeId={scrollSpy.activeId} onPill={scrollSpy.scrollTo} />
      <main>
        <MenuSections register={scrollSpy.register} />
      </main>
      <MenuOverlays activeId={scrollSpy.activeId} onGoToSection={scrollSpy.scrollTo} />
      <Popup />
    </div>
  );
}

function MenuShell({ db }: { db: MenuDb }) {
  return (
    <MenuStateProvider db={db}>
      <MenuBody />
    </MenuStateProvider>
  );
}

// ==== Page ====

export function MenuPage() {
  const menu = useMenu();
  if (menu.status === "loading") return <LoadingSkeleton />;
  if (menu.status === "error") return <ErrorState code={menu.errorCode} onRetry={menu.retry} />;
  return <MenuShell db={menu.db} />;
}
