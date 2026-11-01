import { useEffect, useRef, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../localization/strings";
import type { MenuResponse } from "../../data/types";
import { CloseButton } from "../shared/ui";

interface Props {
  popup: MenuResponse["popup"];
  busy: boolean;
}

const styles = {
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  modal: "relative outline-none data-entering:animate-reveal-in",
  dialog: "outline-none",
  image:
    "block h-auto max-h-[80dvh] w-auto max-w-[min(28rem,calc(100vw-2rem))] rounded-lg bg-white object-contain",
  close: "absolute end-1 top-1",
};

export function PromoPopup({ popup, busy }: Props) {
  const t = useStrings(strings);
  const { enabled, image, delaySeconds } = popup;
  const [isOpen, setIsOpen] = useState(false);

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
      className={styles.overlay}
    >
      <Modal className={styles.modal}>
        <Dialog aria-label={t.promoAlt} className={styles.dialog}>
          <img
            src={image}
            alt={t.promoAlt}
            draggable={false}
            className={styles.image}
          />
          <span className={styles.close}>
            <CloseButton small onPress={() => setIsOpen(false)} />
          </span>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
