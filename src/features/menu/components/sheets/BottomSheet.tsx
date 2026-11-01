import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { cx, CloseButton } from "../shared/ui";

interface Props {
  isOpen: boolean;
  label: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

const CLOSE_DISTANCE = 150;
const FLICK_DISTANCE = 60;
const FLICK_SPEED = 0.6;
const TITLE_FADE_PX = 32;

const styles = {
  overlay:
    "fixed inset-0 z-50 flex items-end justify-center bg-scrim md:items-center md:p-6 data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  modal:
    "flex max-h-[88dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-sheet bg-white shadow-sheet md:max-h-[85dvh] md:max-w-140 md:rounded-b-sheet data-entering:animate-slide-up data-exiting:animate-slide-down",
  modalSettling: "transition-transform duration-500 ease-[var(--ease-smooth)]",
  dialog: "relative flex min-h-0 flex-1 flex-col outline-none",
  topBar:
    "relative z-20 flex h-10 shrink-0 items-center rounded-t-sheet bg-white",
  topBarLine:
    "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-navy/7 transition-opacity duration-150",
  handleArea:
    "absolute inset-0 flex cursor-grab touch-none select-none items-center justify-center transition-opacity duration-150 active:cursor-grabbing",
  handle: "h-1.5 w-10 rounded-full bg-navy/15",
  barTitle:
    "pointer-events-none absolute inset-y-0 start-4 end-14 flex items-center truncate text-body font-bold transition-opacity duration-150",
  closeSlot: "absolute inset-y-0 end-1.5 z-10 flex items-center",
  scroller:
    "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 [overflow-anchor:none] [scroll-behavior:auto]",
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ y: number; time: number } | null>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setDragOffset(0);
  }

  function endDrag(event: PointerEvent<HTMLElement>, cancelled: boolean) {
    if (!dragStart.current) return;
    const distance = event.clientY - dragStart.current.y;
    const speed =
      distance / Math.max(1, performance.now() - dragStart.current.time);
    dragStart.current = null;
    setDragging(false);

    const flicked = distance > FLICK_DISTANCE && speed > FLICK_SPEED;
    if (!cancelled && (distance > CLOSE_DISTANCE || flicked)) onClose();
    else setDragOffset(0);
  }

  const handleProps = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStart.current = { y: event.clientY, time: performance.now() };
      setDragging(true);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (dragStart.current)
        setDragOffset(Math.max(0, event.clientY - dragStart.current.y));
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => endDrag(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => endDrag(event, true),
  };

  const dragStyle =
    dragOffset > 0
      ? ({ transform: `translateY(${dragOffset}px)` } as CSSProperties)
      : undefined;

  // Runs at most once per frame, and writes the fade only to the top bar (not the whole dialog).
  function updateTitleFade() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const topBar = topBarRef.current;
      const scroller = scrollerRef.current;
      if (!topBar || !scroller) return;
      const heading = scroller.querySelector<HTMLElement>("[data-sheet-title]");
      const headingBottom = heading
        ? heading.getBoundingClientRect().bottom -
          scroller.getBoundingClientRect().top
        : TITLE_FADE_PX - scroller.scrollTop;
      const progress = Math.min(
        1,
        Math.max(0, (TITLE_FADE_PX - headingBottom) / TITLE_FADE_PX),
      );
      topBar.style.setProperty("--bar-p", progress.toFixed(3));
    });
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className={styles.overlay}
    >
      <Modal
        style={dragStyle}
        className={({ isEntering, isExiting }) =>
          cx(
            styles.modal,
            !isEntering && !isExiting && !dragging && styles.modalSettling,
          )
        }
      >
        <Dialog aria-label={label} className={styles.dialog}>
          <div ref={topBarRef} className={styles.topBar}>
            <span
              aria-hidden="true"
              className={styles.topBarLine}
              style={{ opacity: "var(--bar-p, 0)" }}
            />
            <div
              {...handleProps}
              aria-hidden="true"
              className={styles.handleArea}
              style={{ opacity: "calc(1 - var(--bar-p, 0))" }}
            >
              <span className={styles.handle} />
            </div>
            <span
              className={styles.barTitle}
              style={{ opacity: "var(--bar-p, 0)" }}
            >
              <span className="truncate">{label}</span>
            </span>
            <div className={styles.closeSlot}>
              <CloseButton small onPress={onClose} />
            </div>
          </div>

          <div
            ref={scrollerRef}
            onScroll={updateTitleFade}
            className={styles.scroller}
          >
            {children}
          </div>

          {footer && <div className={styles.footer}>{footer}</div>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
