import { useCallback, useMemo } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { Header } from "../components";
import { useMenuState } from "../hooks/useMenuState";
import { strings } from "../strings";

interface Props {
  activeId: string;
  onPill: (id: string) => void;
}

export function MenuHeader({ activeId, onPill }: Props) {
  const { menu, openSearch, openCategories } = useMenuState();
  const locale = useLocale();
  const t = useStrings(strings);
  const pick = useCallback(
    (text: { en: string; ar: string }) => text[locale],
    [locale],
  );

  const pills = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    if (menu.signatures.length > 0)
      list.push({ id: "signatures", label: t.signaturesPill });
    if (menu.pairings.length > 0)
      list.push({ id: "pairings", label: t.pairingsPill });
    for (const category of menu.categories)
      list.push({ id: category.id, label: pick(category.name) });
    return list;
  }, [menu, t, pick]);

  return (
    <Header
      pills={pills}
      activeId={activeId}
      onPill={onPill}
      onSearch={openSearch}
      onCategories={openCategories}
    />
  );
}
