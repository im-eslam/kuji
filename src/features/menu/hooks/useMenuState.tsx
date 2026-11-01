import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { lineUnitPrice } from "../lib/pricing";
import type { MenuDb, OrderLine } from "../types";

// ==== Order reducer ====

type OrderAction =
  | { type: "add"; line: OrderLine }
  | { type: "update"; oldKey: string; line: OrderLine }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "prune"; validProductIds: Set<string> };

function mergeOrAdd(lines: OrderLine[], line: OrderLine): OrderLine[] {
  const existing = lines.find((l) => l.key === line.key);
  if (!existing) return [...lines, line];
  return lines.map((l) => (l.key === line.key ? { ...l, qty: l.qty + line.qty } : l));
}

function orderReducer(lines: OrderLine[], action: OrderAction): OrderLine[] {
  switch (action.type) {
    case "add":
      return mergeOrAdd(lines, action.line);
    case "update": {
      if (action.line.key === action.oldKey) {
        return lines.map((l) => (l.key === action.oldKey ? action.line : l));
      }
      const withoutOld = lines.filter((l) => l.key !== action.oldKey);
      return mergeOrAdd(withoutOld, action.line);
    }
    case "setQty":
      return lines.map((l) => (l.key === action.key ? { ...l, qty: action.qty } : l));
    case "remove":
      return lines.filter((l) => l.key !== action.key);
    case "clear":
      return [];
    case "prune":
      return lines.filter((l) => l.parts.every((p) => action.validProductIds.has(p.productId)));
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
  db: MenuDb;
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

export function MenuStateProvider({ db, children }: { db: MenuDb; children: ReactNode }) {
  const [lines, dispatch] = useReducer(orderReducer, []);
  const [overlay, setOverlay] = useState<Overlay>({ type: "none" });
  const [announcement, setAnnouncement] = useState("");
  const [focusLineKey, setFocusLineKey] = useState<string | null>(null);
  const dbRef = useRef(db);
  dbRef.current = db;

  // The order lives in memory only. If the catalog reloads and a product is gone, drop lines that reference it.
  useEffect(() => {
    dispatch({ type: "prune", validProductIds: new Set(db.productsById.keys()) });
  }, [db]);

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const unit = lineUnitPrice(line, db.productsById, db.pairingsById, db.addOnsById) ?? 0;
        return sum + unit * line.qty;
      }, 0),
    [lines, db],
  );
  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  const announce = useCallback((message: string) => setAnnouncement(message), []);

  const value = useMemo<MenuStateValue>(
    () => ({
      db,
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
            ? { type: "item", itemId: line.parts[0].productId, editKey: line.key }
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
    [db, lines, count, subtotal, overlay, announcement, announce, focusLineKey],
  );

  return <MenuStateCtx.Provider value={value}>{children}</MenuStateCtx.Provider>;
}

export function useMenuState(): MenuStateValue {
  const ctx = useContext(MenuStateCtx);
  if (!ctx) throw new Error("useMenuState must be used within MenuStateProvider");
  return ctx;
}
