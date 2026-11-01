import { useState, type ReactNode } from "react";
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../localization/strings";
import type { MenuResponse, Pairing, Product } from "../data/types";
import { CloseButton, Img, Price, PriceWithDiscount, Badge } from "./ui";

interface Props {
  menu: MenuResponse;
  isOpen: boolean;
  onClose: () => void;
  onPickCategory: (categoryId: string) => void;
  onPickPairing: (pairing: Pairing) => void;
  onPickProduct: (product: Product) => void;
}

/** Full-screen search. The dialog's content only exists while it is open, so the text box starts empty every time. */
export function SearchOverlay({ isOpen, onClose, ...rest }: Props) {
  const t = useStrings(strings);

  return (
    // isDismissable also lets Escape close it.
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className="fixed inset-0 z-50 flex justify-center bg-scrim data-entering:animate-scrim-in data-exiting:animate-scrim-out"
    >
      <Modal className="flex h-full w-full max-w-120 flex-col bg-white outline-none">
        <Dialog aria-label={t.a11ySearch} className="flex min-h-0 flex-1 flex-col outline-none">
          <SearchPanel onClose={onClose} {...rest} />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function SearchPanel({ menu, onClose, onPickCategory, onPickPairing, onPickProduct }: Omit<Props, "isOpen">) {
  const t = useStrings(strings);
  const locale = useLocale();
  const [query, setQuery] = useState("");

  // Search in the language the customer is reading. A category matches by name, a product by name or description,
  // and a pairing by the names of its two products.
  const text = query.trim().toLocaleLowerCase();
  const matches = (value: string) => value.toLocaleLowerCase().includes(text);

  const categories = text ? menu.categories.filter((category) => matches(category.name[locale])) : [];
  const pairings = text ? menu.pairings.filter((pairing) => pairing.items.some((product) => matches(product.name[locale]))) : [];
  const products = text
    ? menu.categories.flatMap((category) => category.products).filter((product) => matches(product.name[locale]) || matches(product.description[locale]))
    : [];
  const total = categories.length + pairings.length + products.length;

  return (
    <>
      <div className="flex items-center gap-1 border-b border-arctic ps-4 pe-2">
        <label className="relative my-2 flex h-12 flex-1 items-center">
          <span className="sr-only">{t.a11ySearch}</span>
          <span className="pointer-events-none absolute start-4">
            <Icon name="search" className="size-5" />
          </span>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-12 w-full appearance-none rounded-full border border-arctic bg-mist ps-12 pe-4 text-body outline-none transition-colors duration-150 focus:bg-white"
          />
        </label>
        <CloseButton onPress={onClose} />
      </div>

      <p className="sr-only" aria-live="polite">
        {text ? t.itemsCount(total) : ""}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {!text && <p className="px-4 py-8 text-center text-small font-medium text-navy/65">{t.searchPrompt}</p>}
        {text && total === 0 && <p className="px-4 py-8 text-center text-small font-medium text-navy/65">{t.searchNoMatch(query.trim())}</p>}

        {categories.length > 0 && (
          <section>
            <Heading>{t.groupCategories}</Heading>
            {categories.map((category) => (
              <ResultRow key={category.id} onPress={() => onPickCategory(category.id)} className="min-h-12">
                <span className="flex-1 text-body font-medium">{category.name[locale]}</span>
                <span className="text-caption font-medium text-navy/65">{category.products.length}</span>
              </ResultRow>
            ))}
          </section>
        )}

        {pairings.length > 0 && (
          <section>
            <Heading>{t.groupOffers}</Heading>
            {pairings.map((pairing) => (
              <ResultRow key={pairing.id} onPress={() => onPickPairing(pairing)} className="min-h-18 py-2">
                <span className="flex shrink-0 gap-1">
                  <Img image={pairing.items[0].image} className="size-8 rounded-md" />
                  <Img image={pairing.items[1].image} className="size-8 rounded-md" />
                </span>
                <span className="min-w-0 flex-1 text-body font-medium">
                  {pairing.items[0].name[locale]} + {pairing.items[1].name[locale]}
                </span>
                <Price value={pairing.pricing.current} size="small" />
              </ResultRow>
            ))}
          </section>
        )}

        {products.length > 0 && (
          <section>
            <Heading>{t.groupItems}</Heading>
            {products.map((product) => {
              const inStock = product.availability === "in_stock";
              return (
                <ResultRow key={product.id} onPress={() => onPickProduct(product)} className="min-h-18 py-2">
                  <Img image={product.image} className={`size-12 shrink-0 rounded-md ${inStock ? "" : "grayscale"}`} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-body font-medium">{product.name[locale]}</span>
                    <span className="line-clamp-1 text-caption font-medium text-navy/65">{product.description[locale]}</span>
                    {!inStock && <Badge kind="outOfStock" compact />}
                  </span>
                  <span className={inStock ? "" : "opacity-60"}>
                    <PriceWithDiscount value={product.pricing.current} regular={product.pricing.regular} />
                  </span>
                </ResultRow>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}

function Heading({ children }: { children: string }) {
  return <h2 className="px-4 py-2 text-caption font-semibold text-navy/65">{children}</h2>;
}

/** One pressable result with a thin line under it. */
function ResultRow({ onPress, className, children }: { onPress: () => void; className: string; children: ReactNode }) {
  return (
    <div className="border-b border-mist">
      <Button onPress={onPress} className={`flex w-full items-center gap-3 px-4 text-start data-pressed:bg-mist ${className}`}>
        {children}
      </Button>
    </div>
  );
}
