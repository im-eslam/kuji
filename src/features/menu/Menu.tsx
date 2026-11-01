import { useState } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { defaultChoice, lineTitle, makeLine, useCart, type CartLine } from "./hooks/useCart";
import { CartBar } from "./components/CartBar";
import { CartSheet } from "./components/CartSheet";
import { CategorySection } from "./components/CategorySection";
import { CategorySheet } from "./components/CategorySheet";
import { Header } from "./components/Header";
import { PairingSheet } from "./components/PairingSheet";
import { PairingsSection } from "./components/PairingsSection";
import { ProductSheet } from "./components/ProductSheet";
import { PromoPopup } from "./components/PromoPopup";
import { SearchOverlay } from "./components/SearchOverlay";
import { SignaturesSection } from "./components/SignaturesSection";
import { strings } from "./localization/strings";
import type { MenuResponse, Pairing, Product } from "./data/types";
import { useScrollSpy } from "./hooks/useScrollSpy";

/** Which panel is open on top of the menu. Only one at a time. */
type OpenPanel = "product" | "pairing" | "cart" | "categories" | "search" | null;

/**
 * The menu screen. It owns the two things that change while a customer uses the menu:
 *   1. the cart (see hooks/useCart.ts), and
 *   2. which panel is open.
 * Everything else is drawn from `menu` exactly as the backend sent it.
 */
export function Menu({ menu }: { menu: MenuResponse }) {
  const t = useStrings(strings);
  const locale = useLocale();
  const cart = useCart();

  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  // What the product / pairing sheet last showed. It is kept after the sheet closes, so the closing animation still has content.
  // `id` is new for every opening: the sheet uses it as its `key`, which makes React start the sheet fresh each time.
  const [productSheet, setProductSheet] = useState<{ id: number; product: Product; editing: CartLine | null } | null>(null);
  const [pairingSheet, setPairingSheet] = useState<{ id: number; pairing: Pairing; editing: CartLine | null } | null>(null);
  const [focusLineKey, setFocusLineKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState(""); // read out by screen readers

  // ---- Sections of the page (also the pills in the header) ----
  const sections = [
    ...(menu.signatures.length > 0 ? [{ id: "signatures", label: t.signaturesPill }] : []),
    ...(menu.pairings.length > 0 ? [{ id: "pairings", label: t.pairingsPill }] : []),
    ...menu.categories.map((category) => ({ id: category.id, label: category.name[locale] })),
  ];
  const { activeId, scrollTo } = useScrollSpy(sections.map((section) => section.id));

  // ---- Opening and closing panels ----
  const closePanel = () => setOpenPanel(null);

  function openProduct(product: Product, editing: CartLine | null = null) {
    setProductSheet({ id: Date.now(), product, editing });
    setOpenPanel("product");
  }

  function openPairing(pairing: Pairing, editing: CartLine | null = null) {
    setPairingSheet({ id: Date.now(), pairing, editing });
    setOpenPanel("pairing");
  }

  /** Opens the cart. `focusKey` is the row to put keyboard focus on, if any. */
  function openCart(focusKey: string | null = null) {
    setFocusLineKey(focusKey);
    setOpenPanel("cart");
  }

  /** From the cart, tapping a row opens that product's (or pairing's) sheet to change it. */
  function editLine(line: CartLine) {
    if (line.pairing) openPairing(line.pairing, line);
    else openProduct(line.choices[0].product, line);
  }

  /** Closes the panel, then scrolls. The short wait lets the panel release the page's scrolling first. */
  function goToSection(id: string) {
    closePanel();
    window.setTimeout(() => scrollTo(id), 0);
  }

  // ---- Cart actions ----
  function announce(message: string) {
    setAnnouncement(message);
  }

  /** "Add to order" / "Update order" in a sheet. */
  function submitLine(line: CartLine, editing: CartLine | null) {
    if (editing) {
      cart.replace(editing.key, line);
      announce(t.a11yOrderUpdated);
      openCart(line.key); // after editing, go back to the cart
    } else {
      cart.add(line);
      announce(t.a11yAdded(lineTitle(line.choices, locale)));
      closePanel();
    }
  }

  /** Closing the sheet of a line that was being edited goes back to the cart instead of the menu. */
  function closeSheet(editing: CartLine | null) {
    if (editing) openCart(editing.key);
    else closePanel();
  }

  /** The "+" under "Often ordered with": adds one, in its first size and with no add-ons. */
  function quickAdd(productId: string) {
    const product = menu.categories.flatMap((category) => category.products).find((p) => p.id === productId);
    if (!product || product.availability !== "in_stock") return;
    cart.add(makeLine(null, [defaultChoice(product)], 1));
    announce(t.a11yAdded(product.name[locale]));
  }

  function clearCart() {
    cart.clear();
    announce(t.emptyOrder);
  }

  return (
    <div className="min-h-dvh bg-white pb-24">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <Header sections={sections} activeId={activeId} onSelect={scrollTo} onSearch={() => setOpenPanel("search")} onCategories={() => setOpenPanel("categories")} />

      {/* divide-y-8: a thick light line between sections */}
      <main className="divide-y-8 divide-mist">
        {menu.signatures.length > 0 && <SignaturesSection products={menu.signatures} onOpen={openProduct} />}
        {menu.pairings.length > 0 && <PairingsSection pairings={menu.pairings} onOpen={openPairing} />}
        {menu.categories.map((category) => (
          <CategorySection key={category.id} category={category} onOpen={openProduct} />
        ))}
      </main>

      <CartBar count={cart.count} subtotal={cart.subtotal} sheetOpen={openPanel !== null} onOpen={() => openCart()} />

      {productSheet && (
        <ProductSheet
          key={productSheet.id}
          product={productSheet.product}
          editing={productSheet.editing}
          isOpen={openPanel === "product"}
          onClose={() => closeSheet(productSheet.editing)}
          onSubmit={(line) => submitLine(line, productSheet.editing)}
          onQuickAdd={quickAdd}
        />
      )}
      {pairingSheet && (
        <PairingSheet
          key={pairingSheet.id}
          pairing={pairingSheet.pairing}
          editing={pairingSheet.editing}
          isOpen={openPanel === "pairing"}
          onClose={() => closeSheet(pairingSheet.editing)}
          onSubmit={(line) => submitLine(line, pairingSheet.editing)}
        />
      )}
      <CartSheet
        isOpen={openPanel === "cart"}
        lines={cart.lines}
        count={cart.count}
        subtotal={cart.subtotal}
        focusKey={focusLineKey}
        onClose={closePanel}
        onEdit={editLine}
        onSetQty={cart.setQty}
        onRemove={cart.remove}
        onClear={clearCart}
      />
      <CategorySheet isOpen={openPanel === "categories"} categories={menu.categories} activeId={activeId} onClose={closePanel} onPick={goToSection} />
      <SearchOverlay
        menu={menu}
        isOpen={openPanel === "search"}
        onClose={closePanel}
        onPickCategory={goToSection}
        onPickPairing={openPairing}
        onPickProduct={openProduct}
      />

      <PromoPopup popup={menu.popup} busy={openPanel !== null} />
    </div>
  );
}
