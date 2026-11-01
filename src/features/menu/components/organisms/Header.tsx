import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useCatalog } from '../../lib/catalog'
import { useLang } from '../../state/LangContext'
import { useUI } from '../../state/UIContext'
import { CategoryPill } from '../atoms/CategoryPill'
import { EdgeFade } from '../atoms/EdgeFade'
import { IconButton } from '../atoms/IconButton'
import { LanguagePill } from '../atoms/LanguagePill'
import { Logo } from '../atoms/Logo'

export function Header({ activeId, onPill }: { activeId: string; onPill: (id: string) => void }) {
  const { t, pick, lang } = useLang()
  const ui = useUI()
  const { sections } = useCatalog()
  const rail = useRef<HTMLDivElement>(null)
  const centered = useRef(false)
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null)
  const [animated, setAnimated] = useState(false)
  const [moreAhead, setMoreAhead] = useState(true)

  const pillOf = (id: string) => rail.current?.querySelector<HTMLElement>(`[data-pill-id="${id}"]`) ?? null

  // Yellow highlight position, measured from the real pill so it follows font, language and resize changes.
  const measure = useCallback(() => {
    const pill = pillOf(activeId)
    if (pill) setThumb({ x: pill.offsetLeft, w: pill.offsetWidth })
  }, [activeId])

  useLayoutEffect(measure, [measure, lang])

  useEffect(() => {
    const r = rail.current
    if (!r) return
    const ro = new ResizeObserver(measure)
    ro.observe(r)
    r.querySelectorAll('button').forEach((b) => ro.observe(b))
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [measure, lang])

  // Enable the slide only after the first placement, so the highlight does not fly in from the corner on load.
  useEffect(() => {
    if (thumb && !animated) { const id = requestAnimationFrame(() => setAnimated(true)); return () => cancelAnimationFrame(id) }
  }, [thumb, animated])

  // Keep the active pill centred. Works in RTL because it uses on-screen positions, not scrollLeft.
  useEffect(() => {
    const r = rail.current
    const pill = pillOf(activeId)
    if (!r || !pill) return
    const rr = r.getBoundingClientRect(), pr = pill.getBoundingClientRect()
    const delta = pr.left + pr.width / 2 - (rr.left + rr.width / 2)
    r.scrollBy({ left: delta, behavior: centered.current ? 'smooth' : 'auto' })
    centered.current = true
  }, [activeId, lang])

  const onRailScroll = () => {
    const r = rail.current
    if (r) setMoreAhead(Math.abs(r.scrollLeft) + r.clientWidth < r.scrollWidth - 4)
  }
  useEffect(onRailScroll, [lang])

  return (
    <header className="header-line sticky top-0 z-30 bg-white">
      <div className="flex h-14 items-center gap-1 ps-4 pe-2">
        <Logo />
        <div className="flex-1" />
        <IconButton icon="search" label={t('a11ySearch')} onClick={ui.openSearch} />
        <LanguagePill />
      </div>
      <div className="flex h-12 items-center">
        {/* Fixed on the start side; the rail scrolls beside it and dissolves into it through the edge fade. */}
        <div className="shrink-0 ps-1">
          <IconButton icon="menu" label={t('a11yCategories')} onClick={ui.openCategories} />
        </div>
        <nav aria-label={t('categoriesTitle')} className="relative h-12 min-w-0 flex-1">
          <div
            ref={rail}
            onScroll={onRailScroll}
            className="no-scrollbar relative flex h-12 items-center gap-1 overflow-x-auto overscroll-x-contain ps-4 pe-4"
          >
            <span
              aria-hidden="true"
              className={`absolute top-1 left-0 h-10 rounded-full bg-yellow ${animated ? 'transition-[transform,width] duration-250 ease-(--ease-smooth)' : ''}`}
              style={{ width: thumb?.w ?? 0, transform: `translateX(${thumb?.x ?? 0}px)`, opacity: thumb ? 1 : 0 }}
            />
            {sections.map((s) => (
              <CategoryPill key={s.id} id={s.id} label={pick(s.pill)} active={s.id === activeId} onClick={() => onPill(s.id)} />
            ))}
          </div>
          <EdgeFade edge="start" />
          <EdgeFade edge="end" visible={moreAhead} />
        </nav>
      </div>
    </header>
  )
}
