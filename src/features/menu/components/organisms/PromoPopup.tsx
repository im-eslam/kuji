import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { POPUP } from '../../data/popup'
import { useCatalog } from '../../lib/catalog'
import { useLang } from '../../state/LangContext'
import { EXIT_MS, useUI } from '../../state/UIContext'
import { cx } from '../../lib/cx'
import { CloseButton } from '../atoms/CloseButton'

type Phase = 'hidden' | 'open' | 'closing'

// A picture that opens centred over the menu `POPUP.delayMs` after the page has fully loaded.
// Configured in data/popup.ts. It keeps its own state (not the UIContext overlay) because it is not part of the
// ordering flow, and it never interrupts: if the person has already opened a sheet or search by then, it stays away.
export function PromoPopup() {
  const { lang, pick } = useLang()
  const { overlay } = useUI()
  const { menu } = useCatalog()
  const config = menu.popup
  const image = config.image.trim()
  const remote = /^(https?:)?\/\//.test(image) || image.startsWith('/')
  const url = image ? (remote ? image : POPUP.image) : undefined
  const alt = POPUP.alt
  const delayMs = Math.max(0, config.delaySeconds) * 1000
  const [phase, setPhase] = useState<Phase>('hidden')
  const dialog = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLDivElement>(null)
  const exitTimer = useRef(0)

  const overlayType = useRef(overlay.type)
  useEffect(() => { overlayType.current = overlay.type })

  // Page fully loaded -> wait the delay (while the picture preloads) -> open. Runs once.
  useEffect(() => {
    if (!config.enabled) return
    if (!url) {
      if (import.meta.env.DEV) console.warn(`PromoPopup: "${image}" is empty, so the popup is skipped.`)
      return
    }
    let alive = true
    let delay = 0
    const start = () => {
      const img = new Image()
      const loaded = new Promise<boolean>((resolve) => { img.onload = () => resolve(true); img.onerror = () => resolve(false) })
      img.src = url
      const waited = new Promise<void>((resolve) => { delay = window.setTimeout(resolve, delayMs) })
      // Opens only once both are done, so it never appears as an empty frame; a broken image means no popup at all.
      void Promise.all([loaded, waited]).then(([ok]) => {
        if (alive && ok && overlayType.current === 'none') setPhase('open')
      })
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      alive = false
      window.clearTimeout(delay)
      window.removeEventListener('load', start)
    }
  }, [url, image, config.enabled, delayMs])

  useEffect(() => () => window.clearTimeout(exitTimer.current), [])

  // Plays the exit, then unmounts; a second request while closing is ignored (same pattern as UIContext.close).
  const closingRef = useRef(false)
  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    setPhase('closing')
    exitTimer.current = window.setTimeout(() => setPhase('hidden'), EXIT_MS)
  }, [])

  const visible = phase !== 'hidden'

  // Same housekeeping as BottomSheet: lock page scroll while open, focus the dialog, hand focus back on close.
  useEffect(() => {
    if (!visible) return
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    dialog.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = ''
      if (prev && document.contains(prev) && prev !== document.body) prev.focus({ preventScroll: true })
    }
  }, [visible])

  if (!visible || !url) return null

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return }
    // The close button is the only control, so Tab simply stays on it.
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.current?.querySelector('button')?.focus() }
  }

  return (
    <div
      lang={lang}
      className={cx(
        'fixed inset-0 z-50 flex animate-fade-in items-center justify-center p-4 transition-opacity duration-200 ease-(--ease-exit)',
        phase === 'closing' && 'opacity-0',
      )}
    >
      <div className="absolute inset-0 bg-scrim" onClick={close} aria-hidden="true" />
      <div ref={dialog} role="dialog" aria-modal="true" aria-label={pick(alt)} tabIndex={-1} onKeyDown={onKeyDown} className="relative animate-reveal outline-none">
        <img
          src={url}
          alt={pick(alt)}
          draggable={false}
          className="block h-auto w-auto max-h-[80dvh] max-w-[min(24rem,calc(100vw-2rem))] rounded-lg bg-white object-contain"
        />
        <div ref={closeBtn} className="absolute end-1 top-1">
          <CloseButton small onClick={close} />
        </div>
      </div>
    </div>
  )
}
