import { memo } from 'react'
import type { Item } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { Badge } from '../atoms/Badge'
import { Chevron } from '../atoms/Chevron'
import { Img } from '../atoms/Image'
import { Price } from '../atoms/Price'

// Compact by construction: the height comes from the content and nothing else (no minimum), so a card is as short
// as its text allows and never carries empty space.
//  - Title: up to 2 lines. Description: always 1 line, ellipsis (the full text is one tap away in the sheet).
//    That caps every card at title(2) + description(1) + price, and a one-line title makes a shorter card, not a gap.
//  - The photo is 80px wide and stretches to the card's height, with a 72px floor so a short card still has a real photo.
//  - Price and arrow share one row. The arrow's negative margin keeps it from making the row taller than the price.
//  - The badge hangs on the top border, so it takes no room inside the card and the title keeps its full width.
//  - Padding and gap stay at space-3 on every width: the text column is what is scarce, not the card's breathing room.
export const ListCard = memo(function ListCard({ item, onOpen }: { item: Item; onOpen: (id: string) => void }) {
  const { pick } = useLang()
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="group relative flex w-full gap-3 rounded-lg border border-arctic bg-white p-3 text-start transition-[transform,background-color] duration-150 ease-out active:scale-[0.98] active:bg-mist"
    >
      <Img category={item.categoryId} alt="" className="min-h-18 w-20 shrink-0 self-stretch rounded-md" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-balance text-body font-semibold">{pick(item.name)}</span>
        <span className="truncate text-caption font-medium text-navy-65">{pick(item.desc)}</span>
        <span className="mt-auto flex items-center justify-between pt-1">
          <Price value={item.price} size="small" />
          <span className="-my-1"><Chevron compact /></span>
        </span>
      </span>
      {item.badge && (
        <span className="absolute -top-2.5 end-4">
          <Badge kind={item.badge} compact />
        </span>
      )}
    </button>
  )
})
