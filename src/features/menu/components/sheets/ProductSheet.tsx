import { useState } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import {
  defaultChoice,
  makeLine,
  MAX_QTY_IN_CART,
  MAX_QTY_IN_SHEET,
  priceOf,
  type CartLine,
  type Choice,
} from "../../hooks/useCart";
import { strings } from "../../localization/strings";
import type { Product, ProductPreview } from "../../data/types";
import { ProductOptions } from "../products/ProductOptions";
import {
  AddToCartBar,
  Badge,
  cx,
  focusRing,
  Img,
  PriceWithDiscount,
  PrimaryButton,
  Rolling,
  Swap,
} from "../shared/ui";
import { BottomSheet } from "./BottomSheet";

const ADDED_TICK_MS = 1200;

interface Props {
  product: Product;
  editing: CartLine | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (line: CartLine) => void;
  onQuickAdd: (productId: string) => void;
}

const styles = {
  content: "flex flex-col gap-6",
  hero: "relative mx-4",
  heroImage: "aspect-4/3 w-full rounded-lg md:aspect-3/2",
  heroBadge: "absolute end-2 top-2",
  intro: "flex flex-col items-start gap-2 px-4",
  title: "text-title font-bold text-balance",
  description: "text-small font-medium text-pretty text-navy/65",

  related: "flex flex-col gap-2",
  relatedTitle: "px-4 text-body font-bold",
  relatedRail: "no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1",
};

export function ProductSheet({
  product,
  editing,
  isOpen,
  onClose,
  onSubmit,
  onQuickAdd,
}: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const [choice, setChoice] = useState<Choice>(
    editing?.choices[0] ?? defaultChoice(product),
  );
  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [quickAddedCounts, setQuickAddedCounts] = useState<
    Record<string, number>
  >({});
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const inStock = product.availability === "in_stock";
  const name = product.name[locale];
  const description = product.description[locale];
  const total = priceOf(null, [choice]).current * qty;

  function quickAdd(other: ProductPreview) {
    onQuickAdd(other.id);
    setQuickAddedCounts((counts) => ({
      ...counts,
      [other.id]: (counts[other.id] ?? 0) + 1,
    }));
    setJustAddedId(other.id);
    window.setTimeout(
      () => setJustAddedId((id) => (id === other.id ? null : id)),
      ADDED_TICK_MS,
    );
  }

  const footer = inStock ? (
    <AddToCartBar
      title={name}
      qty={qty}
      max={editing ? MAX_QTY_IN_CART : MAX_QTY_IN_SHEET}
      onQty={setQty}
      label={editing ? t.updateOrder : t.addToOrder}
      total={total}
      onSubmit={() => onSubmit(makeLine(null, [choice], qty))}
    />
  ) : (
    <PrimaryButton isDisabled>{t.outOfStock}</PrimaryButton>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      label={name}
      onClose={onClose}
      footer={footer}
    >
      {" "}
      <div className={styles.content}>
        <div className={styles.hero}>
          <Img
            image={product.image}
            alt={name}
            className={cx(styles.heroImage, !inStock && "grayscale")}
          />
          {!inStock && (
            <span className={styles.heroBadge}>
              <Badge kind="outOfStock" />
            </span>
          )}
        </div>

        <div className={styles.intro}>
          {inStock && product.badge && <Badge kind={product.badge} />}
          <h2 data-sheet-title className={styles.title}>
            {name}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        <ProductOptions
          choice={choice}
          onChange={setChoice}
          isDisabled={!inStock}
        />

        {!editing && product.oftenOrderedWith.length > 0 && (
          <section aria-label={t.oftenOrdered} className={styles.related}>
            <h3 className={styles.relatedTitle}>{t.oftenOrdered}</h3>
            <div className={styles.relatedRail}>
              {product.oftenOrderedWith.map((other) => (
                <OftenOrderedCard
                  key={other.id}
                  product={other}
                  addedCount={quickAddedCounts[other.id] ?? 0}
                  justAdded={justAddedId === other.id}
                  onQuickAdd={() => quickAdd(other)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </BottomSheet>
  );
}

const cardStyles = {
  root: "flex w-28 shrink-0 flex-col gap-1 rounded-md border border-arctic bg-white p-2",
  imageFrame: "relative",
  image: "h-16 w-full rounded-md",
  outOfStockBadge: "absolute end-1 top-1",
  countBadge: "absolute start-1 bottom-1",
  name: "line-clamp-2 min-h-[2lh] text-caption font-medium text-balance",
  nameUnavailable: "text-navy/60",
  footer: "flex items-center justify-between gap-1",
  unavailable: "opacity-60",
  addButton: cx(
    "group -m-2 flex size-12 shrink-0 items-center justify-center rounded-full",
    focusRing,
  ),
  addCircle:
    "flex size-8 items-center justify-center rounded-full transition-[transform,background-color,color] duration-150 ease-out group-data-pressed:scale-90",
  addIdle: "bg-yellow text-navy",
  addDone: "bg-navy text-yellow",
  addIcon: "size-4",
};

function OftenOrderedCard({
  product,
  addedCount,
  justAdded,
  onQuickAdd,
}: {
  product: ProductPreview;
  addedCount: number;
  justAdded: boolean;
  onQuickAdd: () => void;
}) {
  const t = useStrings(strings);
  const locale = useLocale();
  const name = product.name[locale];
  const inStock = product.availability === "in_stock";

  return (
    <div className={cardStyles.root}>
      <div className={cardStyles.imageFrame}>
        <Img
          image={product.image}
          className={cx(cardStyles.image, !inStock && "grayscale")}
        />
        {!inStock && (
          <span className={cardStyles.outOfStockBadge}>
            <Badge kind="outOfStock" compact />
          </span>
        )}
        {addedCount > 0 && (
          <span className={cardStyles.countBadge}>
            <Badge kind="count" compact>
              <Rolling text={t.quickAdded(addedCount)} />
            </Badge>
          </span>
        )}
      </div>
      <span
        className={cx(cardStyles.name, !inStock && cardStyles.nameUnavailable)}
      >
        {name}
      </span>
      <div className={cardStyles.footer}>
        <span className={inStock ? undefined : cardStyles.unavailable}>
          <PriceWithDiscount
            value={product.pricing.current}
            regular={product.pricing.regular}
            size="caption"
          />
        </span>
        {inStock && (
          <Button
            aria-label={t.a11yQuickAdd(name)}
            onPress={onQuickAdd}
            className={cardStyles.addButton}
          >
            <span
              className={cx(
                cardStyles.addCircle,
                justAdded ? cardStyles.addDone : cardStyles.addIdle,
              )}
            >
              <Swap value={justAdded}>
                <Icon
                  name={justAdded ? "check" : "plus"}
                  className={cardStyles.addIcon}
                />
              </Swap>
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
