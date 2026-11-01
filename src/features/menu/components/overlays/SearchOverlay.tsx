import { useState, type ReactNode } from "react";
import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  ModalOverlay,
  SearchField,
} from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../../localization/strings";
import type { MenuResponse, Pairing, Product } from "../../data/types";
import {
  Badge,
  CloseButton,
  cx,
  focusRingInset,
  Img,
  Price,
  PriceWithDiscount,
} from "../shared/ui";

interface Props {
  menu: MenuResponse;
  isOpen: boolean;
  onClose: () => void;
  onPickCategory: (categoryId: string) => void;
  onPickPairing: (pairing: Pairing) => void;
  onPickProduct: (product: Product) => void;
}

const styles = {
  overlay:
    "fixed inset-0 z-50 flex justify-center bg-scrim md:items-start md:p-6 md:pt-[8dvh] data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  modal:
    "flex h-full w-full max-w-120 flex-col overflow-hidden bg-white outline-none md:h-[min(40rem,80dvh)] md:max-w-140 md:rounded-lg md:shadow-sheet",
  dialog: "flex min-h-0 flex-1 flex-col outline-none",

  topBar: "flex items-center gap-1 border-b border-arctic ps-4 pe-2",
  field: "group relative my-2 flex h-12 min-w-0 flex-1 items-center",
  fieldIcon: "pointer-events-none absolute start-4 size-5",
  input:
    "h-12 w-full appearance-none rounded-full border border-arctic bg-mist ps-12 pe-11 text-body outline-none transition-colors duration-150 placeholder:text-navy/55 focus:bg-white data-focus-visible:border-navy [&::-webkit-search-cancel-button]:hidden",
  clear: cx(
    "absolute end-1 flex size-10 items-center justify-center rounded-full group-data-empty:hidden data-hovered:bg-mist data-pressed:bg-arctic",
    "outline-none data-focus-visible:outline-2 data-focus-visible:outline-navy",
  ),
  clearIcon: "size-4",

  results: "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6",
  message:
    "flex flex-col items-center gap-3 px-6 py-12 text-center text-small font-medium text-pretty text-navy/65",
  messageIcon: "size-8",
  groupHeading: "px-4 py-2 text-caption font-semibold text-navy/65",
  rowWrap: "border-b border-mist",
  row: cx(
    "flex w-full items-center gap-3 px-4 text-start data-hovered:bg-mist/60 data-pressed:bg-mist",
    focusRingInset,
  ),
  rowCategory: "min-h-12",
  rowRich: "min-h-18 py-2",
  rowName: "min-w-0 flex-1 text-body font-medium text-balance",
  rowCount: "shrink-0 text-caption font-medium tabular-nums text-navy/65",
  pairThumbs: "flex shrink-0 gap-1",
  pairThumb: "size-8 rounded-md",
  productThumb: "size-12 shrink-0 rounded-md",
  productText: "flex min-w-0 flex-1 flex-col items-start",
  productName: "text-body font-medium text-balance",
  productDescription: "line-clamp-1 text-caption font-medium text-navy/65",
  unavailable: "opacity-60",
};

export function SearchOverlay({ isOpen, onClose, ...rest }: Props) {
  const t = useStrings(strings);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className={styles.overlay}
    >
      <Modal className={styles.modal}>
        <Dialog aria-label={t.a11ySearch} className={styles.dialog}>
          <SearchPanel onClose={onClose} {...rest} />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function SearchPanel({
  menu,
  onClose,
  onPickCategory,
  onPickPairing,
  onPickProduct,
}: Omit<Props, "isOpen">) {
  const t = useStrings(strings);
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const text = query.trim().toLocaleLowerCase();
  const matches = (value: string) => value.toLocaleLowerCase().includes(text);

  const categories = text
    ? menu.categories.filter((category) => matches(category.name[locale]))
    : [];
  const pairings = text
    ? menu.pairings.filter((pairing) =>
        pairing.items.some((product) => matches(product.name[locale])),
      )
    : [];
  const products = text
    ? menu.categories
        .flatMap((category) => category.products)
        .filter(
          (product) =>
            matches(product.name[locale]) ||
            matches(product.description[locale]),
        )
    : [];
  const total = categories.length + pairings.length + products.length;

  return (
    <>
      <div className={styles.topBar}>
        <SearchField
          autoFocus
          value={query}
          onChange={setQuery}
          className={styles.field}
        >
          <Label className="sr-only">{t.a11ySearch}</Label>
          <Icon name="search" className={styles.fieldIcon} />
          <Input placeholder={t.searchPlaceholder} className={styles.input} />
          <Button className={styles.clear}>
            <Icon name="close" className={styles.clearIcon} />
          </Button>
        </SearchField>
        <CloseButton onPress={onClose} />
      </div>

      <p className="sr-only" aria-live="polite">
        {text ? (total === 1 ? t.itemsCountOne : t.itemsCount(total)) : ""}
      </p>

      <div className={styles.results}>
        {!text && (
          <div className={styles.message}>
            <Icon name="search" className={styles.messageIcon} />
            <p>{t.searchPrompt}</p>
          </div>
        )}
        {text && total === 0 && (
          <div className={styles.message}>
            <Icon name="search" className={styles.messageIcon} />
            <p>{t.searchNoMatch(query.trim())}</p>
          </div>
        )}

        {categories.length > 0 && (
          <section aria-label={t.groupCategories}>
            <h2 className={styles.groupHeading}>{t.groupCategories}</h2>
            {categories.map((category) => (
              <ResultRow
                key={category.id}
                onPress={() => onPickCategory(category.id)}
                className={styles.rowCategory}
              >
                <span className={styles.rowName}>{category.name[locale]}</span>
                <span className={styles.rowCount}>
                  {category.products.length}
                </span>
              </ResultRow>
            ))}
          </section>
        )}

        {pairings.length > 0 && (
          <section aria-label={t.groupOffers}>
            <h2 className={styles.groupHeading}>{t.groupOffers}</h2>
            {pairings.map((pairing) => (
              <ResultRow
                key={pairing.id}
                onPress={() => onPickPairing(pairing)}
                className={styles.rowRich}
              >
                <span className={styles.pairThumbs}>
                  {pairing.items.map((product) => (
                    <Img
                      key={product.id}
                      image={product.image}
                      className={styles.pairThumb}
                    />
                  ))}
                </span>
                <span className={styles.rowName}>
                  {pairing.items[0].name[locale]} +{" "}
                  {pairing.items[1].name[locale]}
                </span>
                <Price value={pairing.pricing.current} size="small" />
              </ResultRow>
            ))}
          </section>
        )}

        {products.length > 0 && (
          <section aria-label={t.groupItems}>
            <h2 className={styles.groupHeading}>{t.groupItems}</h2>
            {products.map((product) => {
              const inStock = product.availability === "in_stock";
              const description = product.description[locale];
              return (
                <ResultRow
                  key={product.id}
                  onPress={() => onPickProduct(product)}
                  className={styles.rowRich}
                >
                  <Img
                    image={product.image}
                    className={cx(styles.productThumb, !inStock && "grayscale")}
                  />
                  <span className={styles.productText}>
                    <span className={styles.productName}>
                      {product.name[locale]}
                    </span>
                    {description && (
                      <span className={styles.productDescription}>
                        {description}
                      </span>
                    )}
                    {!inStock && <Badge kind="outOfStock" compact />}
                  </span>
                  <span className={inStock ? undefined : styles.unavailable}>
                    <PriceWithDiscount
                      value={product.pricing.current}
                      regular={product.pricing.regular}
                    />
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

function ResultRow({
  onPress,
  className,
  children,
}: {
  onPress: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.rowWrap}>
      <Button onPress={onPress} className={cx(styles.row, className)}>
        {children}
      </Button>
    </div>
  );
}
