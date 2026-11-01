import { memo, useRef } from 'react'
import type { Item } from '../../data/types'
import { useMultiline } from '../../hooks/useMultiline'
import { useLang } from '../../state/LangContext'
import { cx } from '../../lib/cx'
import { Badge } from '../atoms/Badge'
import { Chevron } from '../atoms/Chevron'
import { Img } from '../atoms/Image'
import { Price } from '../atoms/Price'

interface Props { item: Item; onOpen: (id: string) => void; priority?: boolean }

// Layout rules, so every card in the rail looks finished whatever its title length:
//  - Width is a share of the rail (--card-signature), so the next card always peeks, on a 320px phone and on a 480px column.
//    The photo is square and scales with it.
//  - The text block shares a fixed budget of lines, like the list card: a one-line title gives the description two lines,
//    a two-line title gives it one. Short titles no longer leave a hole above the price; the description fills it.
//  - Cards in the rail are as tall as the tallest, and the price row is pinned to the bottom edge of every one.
//  - Padding is space-3 on small phones (more photo and text), space-4 from 384px up.
export const SignatureCard = memo(function SignatureCard({ item, onOpen, priority }: Props) {
  const { pick } = useLang()
  const name = pick(item.name)
  const titleRef = useRef<HTMLSpanElement>(null)
  const titleWraps = useMultiline(titleRef, name)
  return (
    <button
      type="button"
      data-carousel-card
      onClick={() => onOpen(item.id)}
      className="group flex w-(--card-signature) shrink-0 snap-start flex-col gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out active:scale-[0.98] active:bg-mist xs:p-4"
    >
      <span className="relative block">
        {/* Concentric corners: the photo's radius steps down from the card's, so the gap around it looks even. */}
        <Img category={item.categoryId} alt="" priority={priority} className="aspect-square w-full rounded-md" />
        {/* The tag sits on the photo's top corner rather than in its own row above it. */}
        {item.badge && <span className="absolute end-2 top-2"><Badge kind={item.badge} /></span>}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span ref={titleRef} className="line-clamp-2 text-balance text-heading font-bold">{name}</span>
        <span className={cx('text-pretty text-caption font-medium text-navy-65', titleWraps ? 'line-clamp-1' : 'line-clamp-2')}>{pick(item.desc)}</span>
      </span>
      <span className="mt-auto flex items-center justify-between">
        <Price value={item.price} size="body" />
        <Chevron />
      </span>
    </button>
  )
})
