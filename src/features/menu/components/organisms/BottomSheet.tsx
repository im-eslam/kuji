import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useSheetDrag } from "../../hooks/useSheetDrag";
import { CloseButton } from "../atoms/CloseButton";

interface Props {
  isOpen: boolean;
  /** The dialog's accessible name, and the text the top bar shows once the in-content <SheetTitle> has scrolled away. */
  label: string;
  onClose: () => void;
  footer?: ReactNode;
  /** Where the close button rests before the bar appears: inset over the top photo, or level with a heading row. */
  closeAt?: "media" | "header";
  children: ReactNode;
}

/** Height of the fading bar once it has fully appeared. */
const BAR_PX = 48;
/** The bar fades in over this much scrolling, starting when the in-content title is about to pass under it. */
const RAMP_PX = 40;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const styles = {
  overlay: "fixed inset-0 z-40 flex items-end justify-center bg-scrim data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  panel: "flex max-h-[90dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-sheet bg-white shadow-sheet data-entering:animate-slide-up data-exiting:animate-slide-down",
  settle: "transition-transform duration-500 ease-[var(--ease-smooth)]",
  dialog: "relative flex min-h-0 flex-1 flex-col outline-none",
  handleZone: "absolute inset-x-0 top-0 z-20 flex h-6 w-full cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing",
  handleBar: "h-1.5 w-10 rounded-full bg-navy/15",
  scroller: "min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 pb-6",
  bar: "pointer-events-none absolute inset-x-0 top-0 z-10 h-12",
  barBg: "absolute inset-0 rounded-t-sheet bg-white",
  barHairline: "absolute inset-x-0 bottom-0 h-px bg-navy/7",
  barTitle: "absolute inset-y-0 start-4 end-14 flex items-center truncate text-body font-bold",
  footer: "shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3",
};

export function BottomSheet({ isOpen, label, onClose, footer, closeAt = "header", children }: Props) {
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
    const d = title ? title.getBoundingClientRect().bottom - root.getBoundingClientRect().top : BAR_PX + RAMP_PX - root.scrollTop;
    const p = clamp01((BAR_PX - d) / RAMP_PX);
    dialog.style.setProperty("--bar-p", p.toFixed(3));
  };

  const rest = closeAt === "media" ? 12 : 4;
  const closeStyle: CSSProperties = {
    top: "calc((1 - var(--bar-p, 0)) * 16px)",
    insetInlineEnd: `calc(4px + (1 - var(--bar-p, 0)) * ${rest}px)`,
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable className={styles.overlay}>
      <Modal
        style={drag.style}
        className={({ isEntering, isExiting }) => `${styles.panel} ${!isEntering && !isExiting && !drag.dragging ? styles.settle : ""}`}
      >
        <Dialog ref={dialogRef as never} aria-label={label} className={styles.dialog}>
          <div {...drag.handleProps} aria-hidden="true" className={styles.handleZone}>
            <span className={styles.handleBar} />
          </div>

          <div ref={scrollerRef} onScroll={update} className={styles.scroller}>
            {children}
          </div>

          <div className={styles.bar} style={{ opacity: "var(--bar-p, 0)" }}>
            <span aria-hidden="true" className={styles.barBg} />
            <span aria-hidden="true" className={styles.barHairline} />
            <span className={styles.barTitle} style={{ transform: "translateY(calc((1 - var(--bar-p, 0)) * 8px))" }}>
              <span className="truncate">{label}</span>
            </span>
          </div>
          <div className="absolute z-20" style={closeStyle}>
            <CloseButton small onPress={onClose} />
          </div>

          {footer && <div className={styles.footer}>{footer}</div>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
