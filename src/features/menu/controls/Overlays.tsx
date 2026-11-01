import { useMemo, useRef } from "react";
import { useLocale } from "@/shared/i18n";
import { CategorySheet, ItemSheet, OfferSheet, OrderBar, OrderSheet, SearchOverlay } from "../components";
import { useMenuState } from "../hooks/useMenuState";

interface Props {
  activeId: string;
  onGoToSection: (id: string) => void;
}

export function MenuOverlays({ activeId, onGoToSection }: Props) {
  const { menu, overlay, close } = useMenuState();
  const locale = useLocale();
  const pick = (text: { en: string; ar: string }) => text[locale];
  const lastItem = useRef<{ itemId: string; editKey?: string } | null>(null);

  if (overlay.type === "item") lastItem.current = { itemId: overlay.itemId, editKey: overlay.editKey };

  const categories = useMemo(
    () => menu.categories.map((category) => ({
      category,
      label: pick(category.name),
      count: category.products.length,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [menu, locale],
  );

  return (
    <>
      <OrderBar />
      {lastItem.current && (
        <ItemSheet
          isOpen={overlay.type === "item"}
          itemId={lastItem.current.itemId}
          editKey={overlay.type === "item" ? overlay.editKey : lastItem.current.editKey}
        />
      )}
      {overlay.type === "offer" && <OfferSheet isOpen offerId={overlay.offerId} editKey={overlay.editKey} />}
      <OrderSheet isOpen={overlay.type === "order"} />
      <CategorySheet isOpen={overlay.type === "categories"} onClose={close} categories={categories} activeId={activeId} onPick={onGoToSection} />
      <SearchOverlay isOpen={overlay.type === "search"} onGoToSection={onGoToSection} />
    </>
  );
}
