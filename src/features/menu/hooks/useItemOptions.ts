import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { defaultSizeId } from "../lib/pricing";
import type { AddOn, OrderLinePart, Product } from "../types";

const EMPTY_ADD_ONS: AddOn[] = [];

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
  product: Product | null,
  initial?: { sizeId?: string; addOnIds: string[] },
  resetKey?: string,
): ItemOptionsState {
  const addOns = product?.addOns ?? EMPTY_ADD_ONS;
  const baristaAddOnIds = useMemo(
    () => product?.baristaWay?.addOns.map((addOn) => addOn.id) ?? [],
    [product?.baristaWay?.addOns],
  );
  const [sizeId, setSizeId] = useState(
    initial?.sizeId ?? (product ? defaultSizeId(product) : undefined),
  );
  const [addOnIds, setAddOnIds] = useState<string[]>(initial?.addOnIds ?? []);
  const [baristaOn, setBaristaOn] = useState(
    () =>
      baristaAddOnIds.length > 0 &&
      baristaAddOnIds.every((id) => (initial?.addOnIds ?? []).includes(id)),
  );

  useLayoutEffect(() => {
    if (!resetKey) return;
    setTimeout(() => {
      setSizeId(
        initial?.sizeId ?? (product ? defaultSizeId(product) : undefined),
      );
      setAddOnIds(initial?.addOnIds ?? []);
      setBaristaOn(
        baristaAddOnIds.length > 0 &&
          baristaAddOnIds.every((id) => (initial?.addOnIds ?? []).includes(id)),
      );
    }, 0);
  }, [resetKey]);

  const toggleAddOn = useCallback((id: string) => {
    setAddOnIds((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
    if (baristaOn && baristaAddOnIds.includes(id)) setBaristaOn(false);
  }, [baristaOn, baristaAddOnIds]);

  const toggleBarista = useCallback(() => {
    setBaristaOn((on) => {
      const next = !on;
      setAddOnIds((ids) =>
        next
          ? Array.from(new Set([...ids, ...baristaAddOnIds]))
          : ids.filter((id) => !baristaAddOnIds.includes(id)),
      );
      return next;
    });
  }, [baristaAddOnIds]);

  return useMemo(
    () => ({
      showSize: (product?.sizes.length ?? 0) > 0,
      showBarista: baristaAddOnIds.length > 0,
      showAddOns: addOns.length > 0,
      sizeId,
      setSizeId,
      addOnIds,
      toggleAddOn,
      baristaOn,
      toggleBarista,
      addOns,
    }),
    [
      product,
      addOns,
      baristaAddOnIds,
      sizeId,
      setSizeId,
      addOnIds,
      toggleAddOn,
      baristaOn,
      toggleBarista,
    ],
  );
}

export function partFromOptions(
  product: Product,
  opts: ItemOptionsState,
): OrderLinePart {
  return {
    productId: product.id,
    sizeId: opts.showSize ? opts.sizeId : undefined,
    addOnIds: opts.addOnIds,
  };
}
