import { useEffect, useRef, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { strings } from "../localization/strings";
import type { MenuResponse } from "../data/types";
import { CloseButton } from "./ui";

interface Props {
  popup: MenuResponse["popup"];
  /** True while a sheet or search is open. A popup that becomes ready at that moment is skipped, so it never interrupts. */
  busy: boolean;
}

/**
 * The promotional picture. When it is enabled it loads the picture, waits `delaySeconds`, and then opens once.
 * If the picture cannot be loaded there is no popup at all, so an empty frame is never shown.
 */
export function PromoPopup({ popup, busy }: Props) {
  const t = useStrings(strings);
  const { enabled, image, delaySeconds } = popup;
  const [isOpen, setIsOpen] = useState(false);

  // The timer below should look at the latest `busy`, not the value from when it started.
  const busyRef = useRef(busy);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    if (!enabled || !image) return;
    let cancelled = false;
    let timer = 0;

    const loaded = new Promise<boolean>((resolve) => {
      const picture = new Image();
      picture.onload = () => resolve(true);
      picture.onerror = () => resolve(false);
      picture.src = image;
    });
    const waited = new Promise<void>((resolve) => {
      timer = window.setTimeout(resolve, delaySeconds * 1000);
    });

    void Promise.all([loaded, waited]).then(([ok]) => {
      if (!cancelled && ok && !busyRef.current) setIsOpen(true);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, image, delaySeconds]);

  if (!enabled || !image) return null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 data-entering:animate-scrim-in data-exiting:animate-scrim-out"
    >
      <Modal className="relative outline-none data-entering:animate-reveal-in">
        <Dialog aria-label={t.promoAlt} className="outline-none">
          <img
            src={image}
            alt={t.promoAlt}
            draggable={false}
            className="block h-auto w-auto max-h-[80dvh] max-w-[min(24rem,calc(100vw-2rem))] rounded-lg bg-white object-contain"
          />
          <span className="absolute end-1 top-1">
            <CloseButton small onPress={() => setIsOpen(false)} />
          </span>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
