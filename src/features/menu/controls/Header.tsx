import { useMemo } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { Header } from "../components";
import { useMenuState } from "../hooks/useMenuState";
import { strings } from "../strings";

interface Props {
  activeId: string;
  onPill: (id: string) => void;
}

/** Wires the dumb Header to the catalog: builds its pills (Signatures, Pairings, then categories) and its actions. */
export function MenuHeader({ activeId, onPill }: Props) {
  const { db, openSearch, openCategories } = useMenuState();
  const locale = useLocale();
  const t = useStrings(strings);
  const pick = (text: { en: string; ar: string }) => text[locale];

  const pills = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    if (db.signatures.length > 0) list.push({ id: "signatures", label: t.signaturesPill });
    if (db.pairings.length > 0) list.push({ id: "pairings", label: t.pairingsPill });
    for (const category of db.categories) list.push({ id: category.id, label: pick(category.name) });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, t, locale]);

  return <Header pills={pills} activeId={activeId} onPill={onPill} onSearch={openSearch} onCategories={openCategories} />;
}
