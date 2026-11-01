import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../../data/strings'
import { useCatalog } from '../../lib/catalog'
import { useLang } from '../../state/LangContext'
import { useUI } from '../../state/UIContext'
import { CarouselDot } from '../atoms/CarouselDot'
import { SectionHead } from '../molecules/SectionHead'
import { SignatureCard } from '../molecules/SignatureCard'

export function SignaturesSection() {
  const { pick } = useLang()
  const { openItem } = useUI()
  const catalog = useCatalog()
  const section = catalog.sections.find((s) => s.kind === 'signatures')
  const rail = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const [idx, setIdx] = useState(0)

  // Dots follow the scroll position (distance from the start edge / card width + gap), at most once per frame.
  // The gap is read from the rail itself, so the maths stays right if the spacing token or the card width changes.
  const onScroll = () => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const r = rail.current
      const card = r?.querySelector<HTMLElement>('[data-carousel-card]')
      if (!r || !card) return
      const gap = parseFloat(getComputedStyle(r).columnGap) || 16
      const step = card.offsetWidth + gap
      setIdx(Math.min((section?.itemIds.length ?? 1) - 1, Math.max(0, Math.round(Math.abs(r.scrollLeft) / step))))
    })
  }
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  if (!section) return null

  return (
    <div className="flex flex-col gap-4 py-6">
      <SectionHead title={pick(section.title)} sub={BRAND.signaturesLine} />
      <div ref={rail} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 scroll-ps-4">
        {section.itemIds.map((id, i) => <SignatureCard key={id} item={catalog.itemById[id]} onOpen={openItem} priority={i === 0} />)}
      </div>
      <div className="flex justify-center gap-2" aria-hidden="true">
        {section.itemIds.map((id, i) => <CarouselDot key={id} active={i === idx} />)}
      </div>
    </div>
  )
}
