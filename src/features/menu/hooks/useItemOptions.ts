import { useMemo, useState } from "react";
import { defaultSizeId } from "../lib/pricing";
import type { AddOn, OrderLinePart, Product } from "../types";

export interface ItemOptionsState {
  showSize: boolean;
  showBarista: boolean;
  showAddOns: boolean;
  sizeId: string | undefined;
  setSizeId: (id: string) => void;
  addOnIds: string[];
  toggleAddOn: (id: string) => void;
  baristaOn: boolean;
  toggleBarista: () => void;
  addOns: AddOn[];
}

export function useItemOptions(
  product: Product,
  addOnsForProduct: AddOn[],
  initial?: { sizeId?: string; addOnIds: string[] },
): ItemOptionsState {
  const baristaAddOnIds = product.baristaWay?.addOnIds ?? [];
  const [sizeId, setSizeId] = useState(initial?.sizeId ?? defaultSizeId(product));
  const [addOnIds, setAddOnIds] = useState<string[]>(initial?.addOnIds ?? []);
  const [baristaOn, setBaristaOn] = useState(
    () => baristaAddOnIds.length > 0 && baristaAddOnIds.every((id) => (initial?.addOnIds ?? []).includes(id)),
  );

  const toggleAddOn = (id: string) => {
    setAddOnIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    if (baristaOn && baristaAddOnIds.includes(id)) setBaristaOn(false);
  };

  const toggleBarista = () => {
    setBaristaOn((on) => {
      const next = !on;
      setAddOnIds((ids) =>
        next ? Array.from(new Set([...ids, ...baristaAddOnIds])) : ids.filter((id) => !baristaAddOnIds.includes(id)),
      );
      return next;
    });
  };

  return useMemo(
    () => ({
      showSize: product.sizes.length > 0,
      showBarista: baristaAddOnIds.length > 0,
      showAddOns: addOnsForProduct.length > 0,
      sizeId,
      setSizeId,
      addOnIds,
      toggleAddOn,
      baristaOn,
      toggleBarista,
      addOns: addOnsForProduct,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, addOnsForProduct, sizeId, addOnIds, baristaOn],
  );
}

export function partFromOptions(product: Product, opts: ItemOptionsState): OrderLinePart {
  return { productId: product.id, sizeId: opts.showSize ? opts.sizeId : undefined, addOnIds: opts.addOnIds };
}
