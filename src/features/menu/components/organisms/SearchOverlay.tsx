import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { useMenuState } from "../../hooks/useMenuState";
import { searchMenu } from "../../lib/search";
import { strings } from "../../strings";
import { CloseButton } from "../atoms/CloseButton";
import { SearchGroupHeading } from "../molecules/SearchGroupHeading";
import { SearchResultCategoryRow } from "../molecules/SearchResultCategoryRow";
import { SearchResultOfferRow } from "../molecules/SearchResultOfferRow";
import { SearchResultRow } from "../molecules/SearchResultRow";

interface Props {
  isOpen: boolean;
  onGoToSection: (id: string) => void;
}

const styles = {
  overlay: "fixed inset-0 z-50 flex justify-center bg-scrim data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  panel: "flex h-full w-full max-w-120 flex-col bg-white outline-none",
  searchBar: "flex items-center gap-1 border-b border-arctic ps-4 pe-2",
  field: "relative my-2 flex h-12 flex-1 items-center",
  input:
    "h-12 w-full appearance-none rounded-full border border-arctic bg-mist ps-12 pe-4 text-body outline-none transition-colors duration-150 focus:bg-white",
  results: "min-h-0 flex-1 overflow-y-auto pb-6",
  prompt: "px-4 py-8 text-center text-small font-medium text-navy/65",
};

export function SearchOverlay({ isOpen, onGoToSection }: Props) {
  const locale = useLocale();
  const pick = (text: { en: string; ar: string }) => text[locale];
  const t = useStrings(strings);
  const { menu, close, openItem, openOffer } = useMenuState();
  const [q, setQ] = useState("");
  // The input updates at once; the result list follows on the next idle frame, so typing never waits on rendering rows.
  const dq = useDeferredValue(q);
  const res = useMemo(() => searchMenu(menu, dq, pick), [menu, dq, pick]);
  const total = res.categories.length + res.pairings.length + res.items.length;
  const hasQuery = dq.trim().length > 0;

  useEffect(() => {
    if (isOpen) setQ("");
  }, [isOpen]);

  return (
    // isDismissable also covers Escape: ModalOverlay closes on Escape unless isKeyboardDismissDisabled is set.
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && close()} isDismissable className={styles.overlay}>
      <Modal className={styles.panel}>
        <Dialog aria-label={t.a11ySearch} className="flex min-h-0 flex-1 flex-col outline-none">
          <div className={styles.searchBar}>
            <label className={styles.field}>
              <span className="sr-only">{t.a11ySearch}</span>
              <span className="pointer-events-none absolute start-4">
                <Icon name="search" className="size-5" />
              </span>
              <input
                autoFocus
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={styles.input}
              />
            </label>
            <CloseButton onPress={close} />
          </div>
          <p className="sr-only" aria-live="polite">
            {hasQuery ? t.itemsCount(total) : ""}
          </p>
          <div className={styles.results}>
            {!hasQuery && <p className={styles.prompt}>{t.searchPrompt}</p>}
            {hasQuery && total === 0 && <p className={styles.prompt}>{t.searchNoMatch(dq.trim())}</p>}
            {res.categories.length > 0 && (
              <section>
                <SearchGroupHeading>{t.groupCategories}</SearchGroupHeading>
                {res.categories.map((category) => (
                  <SearchResultCategoryRow
                    key={category.id}
                    name={pick(category.name)}
                    count={category.products.length}
                    onPress={() => {
                      close();
                      window.setTimeout(() => onGoToSection(category.id), 0);
                    }}
                  />
                ))}
              </section>
            )}
            {res.pairings.length > 0 && (
              <section>
                <SearchGroupHeading>{t.groupOffers}</SearchGroupHeading>
                {res.pairings.map((pairing) => (
                  <SearchResultOfferRow
                    key={pairing.id}
                    pairing={pairing}
                    names={[pick(pairing.items[0].name), pick(pairing.items[1].name)]}
                    onPress={openOffer}
                  />
                ))}
              </section>
            )}
            {res.items.length > 0 && (
              <section>
                <SearchGroupHeading>{t.groupItems}</SearchGroupHeading>
                {res.items.map((item) => (
                  <SearchResultRow key={item.id} item={item} name={pick(item.name)} desc={pick(item.description)} onPress={openItem} />
                ))}
              </section>
            )}
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
