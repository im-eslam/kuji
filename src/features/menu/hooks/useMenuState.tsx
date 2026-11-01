import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { allProducts, isInStock } from "../lib/catalog";
import { lineUnitPrice } from "../lib/pricing";
import type { MenuResponse, OrderLine } from "../types";

// ==== Order reducer ====

type OrderAction =
  | { type: "add"; line: OrderLine }
  | { type: "update"; oldKey: string; line: OrderLine }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | {
      type: "prune";
      validProductIds: Set<string>;
      validPairingIds: Set<string>;
    };

function mergeOrAdd(lines: OrderLine[], line: OrderLine): OrderLine[] {
  const existing = lines.find((item) => item.key === line.key);
  if (!existing) return [...lines, line];
  return lines.map((item) =>
    item.key === line.key ? { ...item, qty: item.qty + line.qty } : item,
  );
}

function orderReducer(lines: OrderLine[], action: OrderAction): OrderLine[] {
  switch (action.type) {
    case "add":
      return mergeOrAdd(lines, action.line);
    case "update": {
      if (action.line.key === action.oldKey)
        return lines.map((line) =>
          line.key === action.oldKey ? action.line : line,
        );
      return mergeOrAdd(
        lines.filter((line) => line.key !== action.oldKey),
        action.line,
      );
    }
    case "setQty":
      return lines.map((line) =>
        line.key === action.key ? { ...line, qty: action.qty } : line,
      );
    case "remove":
      return lines.filter((line) => line.key !== action.key);
    case "clear":
      return [];
    case "prune":
      return lines.filter(
        (line) =>
          line.parts.every((part) =>
            action.validProductIds.has(part.productId),
          ) &&
          (line.kind !== "bundle" || action.validPairingIds.has(line.refId)),
      );
    default:
      return lines;
  }
}

// ==== Overlays ====

export type Overlay =
  | { type: "none" }
  | { type: "item"; itemId: string; editKey?: string }
  | { type: "offer"; offerId: string; editKey?: string }
  | { type: "order" }
  | { type: "categories" }
  | { type: "search" };

interface MenuStateValue {
  menu: MenuResponse;
  lines: OrderLine[];
  count: number;
  subtotal: number;
  add: (line: OrderLine) => void;
  updateLine: (oldKey: string, line: OrderLine) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearOrder: () => void;
  overlay: Overlay;
  openItem: (itemId: string) => void;
  openOffer: (offerId: string) => void;
  openOrder: () => void;
  openCategories: () => void;
  openSearch: () => void;
  editLine: (line: OrderLine) => void;
  swapToOrder: (focusKey: string) => void;
  close: () => void;
  announcement: string;
  announce: (message: string) => void;
  focusLineKey: string | null;
  clearFocusLine: () => void;
}

const MenuStateCtx = createContext<MenuStateValue | null>(null);

export function MenuStateProvider({
  menu,
  children,
}: {
  menu: MenuResponse;
  children: ReactNode;
}) {
  const [lines, dispatch] = useReducer(orderReducer, []);
  const [overlay, setOverlay] = useState<Overlay>({ type: "none" });
  const [announcement, setAnnouncement] = useState("");
  const [focusLineKey, setFocusLineKey] = useState<string | null>(null);

  // Keep the in-memory order valid when a refreshed menu removes or disables a product.
  useEffect(() => {
    const validProductIds = new Set(
      allProducts(menu)
        .filter(isInStock)
        .map((product) => product.id),
    );
    const validPairingIds = new Set(menu.pairings.map((pairing) => pairing.id));
    dispatch({ type: "prune", validProductIds, validPairingIds });
  }, [menu]);

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + (lineUnitPrice(line, menu) ?? 0) * line.qty,
        0,
      ),
    [lines, menu],
  );
  const count = useMemo(
    () => lines.reduce((total, line) => total + line.qty, 0),
    [lines],
  );
  const announce = useCallback(
    (message: string) => setAnnouncement(message),
    [],
  );

  const value = useMemo<MenuStateValue>(
    () => ({
      menu,
      lines,
      count,
      subtotal,
      add: (line) => dispatch({ type: "add", line }),
      updateLine: (oldKey, line) => dispatch({ type: "update", oldKey, line }),
      setQty: (key, qty) => dispatch({ type: "setQty", key, qty }),
      removeLine: (key) => dispatch({ type: "remove", key }),
      clearOrder: () => dispatch({ type: "clear" }),
      overlay,
      openItem: (itemId) => setOverlay({ type: "item", itemId }),
      openOffer: (offerId) => setOverlay({ type: "offer", offerId }),
      openOrder: () => setOverlay({ type: "order" }),
      openCategories: () => setOverlay({ type: "categories" }),
      openSearch: () => setOverlay({ type: "search" }),
      editLine: (line) =>
        setOverlay(
          line.kind === "item"
            ? {
                type: "item",
                itemId: line.parts[0].productId,
                editKey: line.key,
              }
            : { type: "offer", offerId: line.refId, editKey: line.key },
        ),
      swapToOrder: (focusKey) => {
        setOverlay({ type: "order" });
        setFocusLineKey(focusKey);
      },
      close: () => setOverlay({ type: "none" }),
      announcement,
      announce,
      focusLineKey,
      clearFocusLine: () => setFocusLineKey(null),
    }),
    [
      menu,
      lines,
      count,
      subtotal,
      overlay,
      announcement,
      announce,
      focusLineKey,
    ],
  );

  return (
    <MenuStateCtx.Provider value={value}>{children}</MenuStateCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMenuState(): MenuStateValue {
  const context = useContext(MenuStateCtx);
  if (!context)
    throw new Error("useMenuState must be used within MenuStateProvider");
  return context;
}
