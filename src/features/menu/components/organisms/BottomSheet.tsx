import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useSheetDrag } from "../../hooks/useSheetDrag";
import { CloseButton } from "../atoms/CloseButton";

interface Props {
  isOpen: boolean;
  /** The dialog's accessible name, and the text the top bar shows once the in-content <SheetTitle> has scrolled away. */
  label: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

/** The handle-to-title crossfade ramps over this much scrolling, ending exactly as the title passes under the bar. */
const RAMP_PX = 32;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const styles = {
  overlay: "fixed inset-0 z-40 flex items-end justify-center bg-scrim data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  panel: "flex max-h-[90dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-sheet bg-white shadow-sheet data-entering:animate-slide-up data-exiting:animate-slide-down",
  settle: "transition-transform duration-500 ease-[var(--ease-smooth)]",
  dialog: "relative flex min-h-0 flex-1 flex-col outline-none",
  bar: "relative z-20 flex h-10 shrink-0 items-center rounded-t-sheet bg-white",
  barHairline: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-navy/7 transition-opacity duration-150",
  handleZone:
    "absolute inset-0 flex cursor-grab touch-none select-none items-center justify-center transition-opacity duration-150 active:cursor-grabbing",
  handleBar: "h-1.5 w-10 rounded-full bg-navy/15",
  titleLayer: "pointer-events-none absolute inset-y-0 start-4 end-12 flex items-center truncate text-body font-bold transition-opacity duration-150",
  closeSlot: "absolute end-1.5 inset-y-0 z-10 flex items-center",
  scroller: "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6",
  footer: "shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3",
};

export function BottomSheet({ isOpen, label, onClose, footer, children }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useSheetDrag(onClose);
  const { reset } = drag;

  useLayoutEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const update = () => {
    const dialog = dialogRef.current;
    const root = scrollerRef.current;
    if (!dialog || !root) return;
    const title = root.querySelector<HTMLElement>("[data-sheet-title]");
    const d = title ? title.getBoundingClientRect().bottom - root.getBoundingClientRect().top : RAMP_PX - root.scrollTop;
    const p = clamp01((RAMP_PX - d) / RAMP_PX);
    dialog.style.setProperty("--bar-p", p.toFixed(3));
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable className={styles.overlay}>
      <Modal
        style={drag.style}
        className={({ isEntering, isExiting }) => `${styles.panel} ${!isEntering && !isExiting && !drag.dragging ? styles.settle : ""}`}
      >
        <Dialog ref={dialogRef as never} aria-label={label} className={styles.dialog}>
          <div className={styles.bar}>
            <span aria-hidden="true" className={styles.barHairline} style={{ opacity: "var(--bar-p, 0)" }} />
            <div {...drag.handleProps} aria-hidden="true" className={styles.handleZone} style={{ opacity: "calc(1 - var(--bar-p, 0))" }}>
              <span className={styles.handleBar} />
            </div>
            <span className={styles.titleLayer} style={{ opacity: "var(--bar-p, 0)" }}>
              <span className="truncate">{label}</span>
            </span>
            <div className={styles.closeSlot}>
              <CloseButton small onPress={onClose} />
            </div>
          </div>

          <div ref={scrollerRef} onScroll={update} className={styles.scroller}>
            {children}
          </div>

          {footer && <div className={styles.footer}>{footer}</div>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
