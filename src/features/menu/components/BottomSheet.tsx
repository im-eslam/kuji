import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { CloseButton } from "./ui";

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


export function BottomSheet({ isOpen, label, onClose, footer, children }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // ---- Drag down to close ----
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
    const speed = distance / Math.max(1, performance.now() - dragStart.current.time);
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
      if (dragStart.current) setDragOffset(Math.max(0, event.clientY - dragStart.current.y));
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => endDrag(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => endDrag(event, true),
  };

  const dragStyle = dragOffset > 0 ? ({ transform: `translateY(${dragOffset}px)`, "--sheet-drag": `${dragOffset}px` } as CSSProperties) : undefined;

  // ---- Handle turns into the title while scrolling ----
  function updateTitleFade() {
    const dialog = dialogRef.current;
    const scroller = scrollerRef.current;
    if (!dialog || !scroller) return;
    const heading = scroller.querySelector<HTMLElement>("[data-sheet-title]");
    const headingBottom = heading ? heading.getBoundingClientRect().bottom - scroller.getBoundingClientRect().top : TITLE_FADE_PX - scroller.scrollTop;
    const progress = Math.min(1, Math.max(0, (TITLE_FADE_PX - headingBottom) / TITLE_FADE_PX));
    dialog.style.setProperty("--bar-p", progress.toFixed(3));
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim data-entering:animate-scrim-in data-exiting:animate-scrim-out"
    >
      <Modal
        style={dragStyle}
        className={({ isEntering, isExiting }) =>
          `flex max-h-[88dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-sheet bg-white shadow-sheet data-entering:animate-slide-up data-exiting:animate-slide-down ${
            !isEntering && !isExiting && !dragging ? "transition-transform duration-500 ease-[var(--ease-smooth)]" : ""
          }`
        }
      >
        <Dialog ref={dialogRef} aria-label={label} className="relative flex min-h-0 flex-1 flex-col outline-none">
          {/* Top bar */}
          <div className="relative z-20 flex h-10 shrink-0 items-center rounded-t-sheet bg-white">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-navy/7 transition-opacity duration-150" style={{ opacity: "var(--bar-p, 0)" }} />
            <div
              {...handleProps}
              aria-hidden="true"
              className="absolute inset-0 flex cursor-grab touch-none select-none items-center justify-center transition-opacity duration-150 active:cursor-grabbing"
              style={{ opacity: "calc(1 - var(--bar-p, 0))" }}
            >
              <span className="h-1.5 w-10 rounded-full bg-navy/15" />
            </div>
            <span
              className="pointer-events-none absolute inset-y-0 start-4 end-12 flex items-center truncate text-body font-bold transition-opacity duration-150"
              style={{ opacity: "var(--bar-p, 0)" }}
            >
              <span className="truncate">{label}</span>
            </span>
            <div className="absolute end-1.5 inset-y-0 z-10 flex items-center">
              <CloseButton small onPress={onClose} />
            </div>
          </div>

          <div ref={scrollerRef} onScroll={updateTitleFade} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
            {children}
          </div>

          {footer && <div className="shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
