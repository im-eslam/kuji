import { useState } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { defaultChoice, makeLine, MAX_QTY_IN_CART, MAX_QTY_IN_SHEET, priceOf, type CartLine, type Choice } from "../hooks/useCart";
import { strings } from "../localization/strings";
import type { Product, ProductPreview } from "../data/types";
import { BottomSheet } from "./BottomSheet";
import { ProductOptions } from "./ProductOptions";
import { AddToCartBar, Badge, Img, PriceWithDiscount, Rolling, Swap } from "./ui";

/** How long the "added" tick stays on a quick-add button. */
const ADDED_TICK_MS = 1200;

interface Props {
  product: Product;
  /** The cart line being edited, or null when the customer is adding something new. */
  editing: CartLine | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (line: CartLine) => void;
  /** Adds one of a product from "Often ordered with" straight to the cart. */
  onQuickAdd: (productId: string) => void;
}

/**
 * Details of one product: picture, description, size / add-on choices, quantity, and "Add to order".
 * Its choices live here as state. The parent gives it a new `key` for every opening, so each opening starts fresh.
 */
export function ProductSheet({ product, editing, isOpen, onClose, onSubmit, onQuickAdd }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();
  const [choice, setChoice] = useState<Choice>(editing?.choices[0] ?? defaultChoice(product));
  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [quickAddedCounts, setQuickAddedCounts] = useState<Record<string, number>>({});
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const inStock = product.availability === "in_stock";
  const name = product.name[locale];
  const total = priceOf(null, [choice]).current * qty;

  function quickAdd(other: ProductPreview) {
    onQuickAdd(other.id);
    setQuickAddedCounts((counts) => ({ ...counts, [other.id]: (counts[other.id] ?? 0) + 1 }));
    setJustAddedId(other.id);
    window.setTimeout(() => setJustAddedId((id) => (id === other.id ? null : id)), ADDED_TICK_MS);
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      label={name}
      onClose={onClose}
      footer={
        inStock && (
          <AddToCartBar
            title={name}
            qty={qty}
            max={editing ? MAX_QTY_IN_CART : MAX_QTY_IN_SHEET}
            onQty={setQty}
            label={editing ? t.updateOrder : t.addToOrder}
            total={total}
            onSubmit={() => onSubmit(makeLine(null, [choice], qty))}
          />
        )
      }
    >
      <div className="flex flex-col gap-6">
        <div className="px-4">
          <div className="relative">
            <Img image={product.image} alt={name} className={`aspect-4/3 w-full rounded-lg ${inStock ? "" : "grayscale"}`} />
            {!inStock && (
              <span className="absolute end-2 top-2">
                <Badge kind="outOfStock" />
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4">
          {inStock && product.badge && (
            <div>
              <Badge kind={product.badge} />
            </div>
          )}
          <h2 data-sheet-title className="text-title font-bold">
            {name}
          </h2>
          <p className="text-small font-medium text-navy/65">{product.description[locale]}</p>
        </div>

        <ProductOptions choice={choice} onChange={setChoice} />

        {!editing && product.oftenOrderedWith.length > 0 && (
          <section aria-label={t.oftenOrdered} className="flex flex-col gap-2">
            <h3 className="px-4 text-body font-bold">{t.oftenOrdered}</h3>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
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

function OftenOrderedCard({ product, addedCount, justAdded, onQuickAdd }: {
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
    <div className="flex w-26 shrink-0 flex-col gap-1 rounded-md border border-arctic bg-white p-2">
      <div className="relative">
        <Img image={product.image} className={`h-16 w-full rounded-md ${inStock ? "" : "grayscale"}`} />
        {!inStock && (
          <span className="absolute end-1 top-1">
            <Badge kind="outOfStock" compact />
          </span>
        )}
        {addedCount > 0 && (
          <span className="absolute bottom-1 start-1">
            <Badge kind="count" compact>
              <Rolling text={t.quickAdded(addedCount)} />
            </Badge>
          </span>
        )}
      </div>
      <span className={`line-clamp-2 min-h-[2lh] text-caption font-medium ${inStock ? "" : "text-navy/60"}`}>{name}</span>
      <div className="flex items-center justify-between">
        <span className={inStock ? "" : "opacity-60"}>
          <PriceWithDiscount value={product.pricing.current} regular={product.pricing.regular} size="caption" />
        </span>
        {inStock && (
          // A 48px tap target around a 32px circle.
          <Button aria-label={t.a11yQuickAdd(name)} onPress={onQuickAdd} className="group -m-2 flex size-12 shrink-0 items-center justify-center">
            <span
              className={`flex size-8 items-center justify-center rounded-full transition-[transform,background-color,color] duration-150 ease-out group-data-pressed:scale-90 ${
                justAdded ? "bg-navy text-yellow" : "bg-yellow text-navy"
              }`}
            >
              <Swap value={justAdded}>
                <Icon name={justAdded ? "check" : "plus"} className="size-4" />
              </Swap>
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
