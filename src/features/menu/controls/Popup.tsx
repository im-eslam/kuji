import { useEffect, useRef, useState } from "react";
import { useStrings } from "@/shared/i18n";
import { PromoPopup } from "../components";
import { useMenuState } from "../hooks/useMenuState";
import { strings } from "../strings";

/** Waits for the popup image to preload and its delay to pass, then opens it only if nothing else is open. */
export function Popup() {
  const { db, overlay } = useMenuState();
  const t = useStrings(strings);
  const { enabled, image, delaySeconds } = db.popup;
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const overlayType = useRef(overlay.type);
  useEffect(() => {
    overlayType.current = overlay.type;
  });

  useEffect(() => {
    if (!enabled || !image) return;
    let alive = true;
    let delayId = 0;
    const start = () => {
      const img = new Image();
      const loaded = new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
      img.src = image;
      const waited = new Promise<void>((resolve) => {
        delayId = window.setTimeout(resolve, delaySeconds * 1000);
      });
      // Opens only once both are done, so it never appears as an empty frame; a broken image means no popup at all.
      void Promise.all([loaded, waited]).then(([ok]) => {
        if (alive && ok && overlayType.current === "none") setReady(true);
      });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      alive = false;
      window.clearTimeout(delayId);
      window.removeEventListener("load", start);
    };
  }, [enabled, image, delaySeconds]);

  if (!enabled || !image || dismissed) return null;

  return <PromoPopup isOpen={ready} imageUrl={image} alt={t.promoAlt} onClose={() => setDismissed(true)} />;
}
