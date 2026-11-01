import { useRef, useState, type ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useSheetDrag } from "./useSheetDrag";
import { cx, CloseButton } from "../shared/ui";

interface Props {
  isOpen: boolean;
  label: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

const styles = {
  overlay:
    "fixed inset-0 z-50 flex items-end justify-center bg-scrim md:items-center md:p-6 data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  modal:
    "flex max-h-[88dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-sheet bg-white shadow-sheet md:max-h-[85dvh] md:max-w-140 md:rounded-b-sheet data-entering:animate-slide-up data-exiting:animate-slide-down",
  modalSettling: "transition-transform duration-500 ease-[var(--ease-smooth)]",
  dialog: "relative flex min-h-0 flex-1 flex-col outline-none",
  // `group` + the data-stuck attribute (set once by an observer) replace any per-scroll work.
  topBar:
    "group relative z-20 flex h-10 shrink-0 items-center rounded-t-sheet bg-white",
  topBarLine:
    "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-navy/7 opacity-0 transition-opacity duration-150 group-data-stuck:opacity-100",
  handleArea:
    "absolute inset-0 flex cursor-grab touch-none select-none items-center justify-center transition-opacity duration-150 active:cursor-grabbing group-data-stuck:opacity-0",
  handle: "h-1.5 w-10 rounded-full bg-navy/15",
  barTitle:
    "pointer-events-none absolute inset-y-0 start-4 end-14 flex items-center truncate text-body font-bold opacity-0 transition-opacity duration-150 group-data-stuck:opacity-100",
  closeSlot: "absolute inset-y-0 end-1.5 z-10 flex items-center",
  scroller:
    "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 [overflow-anchor:none]",
  footer:
    "shrink-0 border-t border-mist bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]",
};

export function BottomSheet({
  isOpen,
  label,
  onClose,
  footer,
  children,
}: Props) {
  const { handleProps, style, dragging, reset } = useSheetDrag(onClose);
  const topBarRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) reset();
  }

  // Watches the big heading once. Nothing runs while scrolling: the observer only fires when the
  // heading leaves or enters the view, and it just flips an attribute (no React re-render).
  function setScroller(scroller: HTMLDivElement | null) {
    observer.current?.disconnect();
    observer.current = null;
    const heading = scroller?.querySelector<HTMLElement>("[data-sheet-title]");
    if (!scroller || !heading) return;
    observer.current = new IntersectionObserver(
      ([entry]) => {
        const bar = topBarRef.current;
        if (!bar || !entry.rootBounds) return;
        const gone =
          !entry.isIntersecting &&
          entry.boundingClientRect.bottom < entry.rootBounds.top + 1;
        if (gone) bar.setAttribute("data-stuck", "");
        else bar.removeAttribute("data-stuck");
      },
      { root: scroller, threshold: 0 },
    );
    observer.current.observe(heading);
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className={styles.overlay}
    >
      <Modal
        style={style}
        className={({ isEntering, isExiting }) =>
          cx(
            styles.modal,
            !isEntering && !isExiting && !dragging && styles.modalSettling,
          )
        }
      >
        <Dialog aria-label={label} className={styles.dialog}>
          <div ref={topBarRef} className={styles.topBar}>
            <span aria-hidden="true" className={styles.topBarLine} />
            <div
              {...handleProps}
              aria-hidden="true"
              className={styles.handleArea}
            >
              <span className={styles.handle} />
            </div>
            <span className={styles.barTitle}>
              <span className="truncate">{label}</span>
            </span>
            <div className={styles.closeSlot}>
              <CloseButton small onPress={onClose} />
            </div>
          </div>

          <div ref={setScroller} className={styles.scroller}>
            {children}
          </div>

          {footer && <div className={styles.footer}>{footer}</div>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
