import { useMemo } from "react";
import { useLocale } from "@/shared/i18n";
import { CategorySheet, ItemSheet, OfferSheet, OrderBar, OrderSheet, SearchOverlay } from "../components";
import { useMenuState } from "../hooks/useMenuState";

interface Props {
  activeId: string;
  onGoToSection: (id: string) => void;
}

/** The order bar plus every sheet/overlay, switched on the single `overlay` state machine. */
export function MenuOverlays({ activeId, onGoToSection }: Props) {
  const { db, overlay, close } = useMenuState();
  const locale = useLocale();
  const pick = (text: { en: string; ar: string }) => text[locale];

  const categories = useMemo(
    () =>
      db.categories.map((category) => ({
        category,
        label: pick(category.name),
        count: db.productsByCategory.get(category.id)?.length ?? 0,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, locale],
  );

  return (
    <>
      <OrderBar />
      <ItemSheet
        isOpen={overlay.type === "item"}
        itemId={overlay.type === "item" ? overlay.itemId : ""}
        editKey={overlay.type === "item" ? overlay.editKey : undefined}
      />
      <OfferSheet
        isOpen={overlay.type === "offer"}
        offerId={overlay.type === "offer" ? overlay.offerId : ""}
        editKey={overlay.type === "offer" ? overlay.editKey : undefined}
      />
      <OrderSheet isOpen={overlay.type === "order"} />
      <CategorySheet isOpen={overlay.type === "categories"} onClose={close} categories={categories} activeId={activeId} onPick={onGoToSection} />
      <SearchOverlay isOpen={overlay.type === "search"} onGoToSection={onGoToSection} />
    </>
  );
}
