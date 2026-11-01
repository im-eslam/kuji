import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { SheetCtx } from '../../state/SheetContext'
import { useUI } from '../../state/UIContext'
import { cx } from '../../lib/cx'
import { CloseButton } from '../atoms/CloseButton'

interface Props {
  /** The dialog's accessible name, and the text the top bar shows once the in-content <SheetTitle> has scrolled away. */
  label: string
  onClose: () => void
  instant?: boolean
  footer?: ReactNode
  /** Where the close button rests before the bar appears: inset over the top photo, or level with a heading row. */
  closeAt?: 'media' | 'header'
  children: ReactNode
}

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'

/** Height of the bar once it has appeared. */
const BAR_PX = 48
/** The bar fades in over this much scrolling, starting when the in-content title is about to pass under it. */
const RAMP_PX = 40

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

// Nothing sits above the content at first: the close button floats over it. As the in-content title scrolls away, a
// bar (title + close) fades in, driven directly by the scroll position, so the title seems to travel into the bar and
// nothing switches on. `--bar-p` (0 to 1) is that progress; it is set on the sheet itself, so scrolling never re-renders React.
export function BottomSheet({ label, onClose, instant, footer, closeAt = 'header', children }: Props) {
  const { closing } = useUI()
  const ref = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLElement | null>(null)
  const drag = useSheetDrag(ref, scroller, onClose)

  const update = useCallback(() => {
    const sheet = ref.current
    const root = scroller.current
    if (!sheet || !root) return
    const el = title.current
    // d = how far the title's bottom edge is below the top of the sheet. Plenty of room: p = 0. Gone off the top: p = 1.
    const d = el ? el.getBoundingClientRect().bottom - root.getBoundingClientRect().top : BAR_PX + RAMP_PX - root.scrollTop
    const p = clamp01((BAR_PX - d) / RAMP_PX)
    sheet.style.setProperty('--bar-p', p.toFixed(3))
    sheet.style.setProperty('--bar-pe', p > 0.4 ? 'auto' : 'none')
  }, [])
  const sheetValue = useMemo(() => ({ registerTitle: (el: HTMLElement | null) => { title.current = el; update() } }), [update])

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const el = ref.current
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = ''
      if (prev && document.contains(prev) && prev !== document.body) prev.focus({ preventScroll: true })
    }
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
    if (e.key !== 'Tab' || !ref.current) return
    const f = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
    if (f.length === 0) return
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  // Exit slides the sheet from wherever it currently is (including mid-drag), so a drag-to-close never snaps back first.
  const transform = closing ? 'translateY(100%)' : drag.offset ? `translateY(${drag.offset}px)` : undefined

  // The button glides from its resting spot to its place in the bar as the bar fades in. Logical inset: flips in Arabic.
  const rest = closeAt === 'media' ? 12 : 4
  const closePos: CSSProperties = {
    top: 'calc((1 - var(--bar-p, 0)) * 16px)',
    insetInlineEnd: `calc(4px + (1 - var(--bar-p, 0)) * ${rest}px)`,
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-center">
      <div
        className={cx(
          'absolute inset-0 bg-scrim transition-opacity duration-200 ease-(--ease-exit)',
          !instant && 'animate-scrim-in',
          closing && 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative h-full w-full max-w-120">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          style={{ transform }}
          className={cx(
            'absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-sheet bg-white outline-none will-change-transform',
            !instant && 'animate-slide-up',
            // In: 260ms easing out (also the snap-back after a short drag). Out: 200ms accelerating away.
            !drag.dragging && (closing ? 'transition-transform duration-200 ease-(--ease-exit)' : 'transition-transform duration-260 ease-(--ease-smooth)'),
          )}
        >
          <SheetCtx.Provider value={sheetValue}>
            <div ref={scroller} onScroll={update} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 pb-6">
              {children}
            </div>
          </SheetCtx.Provider>

          {/* The bar. It fades in with scroll and only takes touches once it is mostly there, so it never blocks the content under it. */}
          <div
            {...drag.barHandlers}
            className="absolute inset-x-0 top-0 z-10 h-12 touch-none select-none [pointer-events:var(--bar-pe,none)] md:cursor-grab"
          >
            <span aria-hidden="true" className="absolute inset-0 rounded-t-sheet bg-white" style={{ opacity: 'min(1, calc(var(--bar-p, 0) * 2))' }} />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-navy/7" style={{ opacity: 'var(--bar-p, 0)' }} />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 start-4 end-14 flex items-center truncate text-body font-bold"
              style={{ opacity: 'var(--bar-p, 0)', transform: 'translateY(calc((1 - var(--bar-p, 0)) * 8px))' }}
            >
              <span className="truncate">{label}</span>
            </span>
          </div>
          <div className="absolute z-20" style={closePos}>
            <CloseButton small onClick={onClose} />
          </div>

          {footer && <div className="footer-fade shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
