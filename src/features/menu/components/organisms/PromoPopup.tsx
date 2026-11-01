import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { CloseButton } from "../atoms/CloseButton";

interface Props {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

const styles = {
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  panel: "relative outline-none data-entering:animate-reveal-in",
  image: "block h-auto w-auto max-h-[80dvh] max-w-[min(24rem,calc(100vw-2rem))] rounded-lg bg-white object-contain",
  close: "absolute end-1 top-1",
};

// A picture that opens centred over the menu once it has had its chance to preload and the configured delay has
// passed. It never interrupts: the control that drives `isOpen` only opens it when no other overlay is open.
export function PromoPopup({ isOpen, imageUrl, alt, onClose }: Props) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable className={styles.overlay}>
      <Modal className={styles.panel}>
        <Dialog aria-label={alt} className="outline-none">
          <img src={imageUrl} alt={alt} draggable={false} className={styles.image} />
          <span className={styles.close}>
            <CloseButton small onPress={onClose} />
          </span>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
