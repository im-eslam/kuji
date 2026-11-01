import { memo } from 'react'
import type { Offer } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { getItem } from '../../lib/catalog'
import { offerBase, offerRegularBase, offerSavings } from '../../lib/pricing'
import { Chevron } from '../atoms/Chevron'
import { Chip } from '../atoms/Chip'
import { Icon } from '../atoms/Icon'
import { Img } from '../atoms/Image'
import { Price } from '../atoms/Price'

// Layout rules:
//  - The card fills its slot in the rail (the rail sets the width, --card-offer), and the photo pair keeps a 2:1
//    shape, so it scales with the card instead of holding a fixed height.
//  - The savings chip sits on the photo's end corner, exactly where the badge sits on a signature card. It takes no row of its
//    own, so a pair with no saving has no blank strip, and every card is the same height without reserving one.
//  - The pair is named one product per line ("Iced Latte" / "+ Brownies"). Always two lines for a normal name, so
//    the title block is never half empty, and a long pair never ends in an ellipsis (names wrap, never truncate).
//  - Cards in the rail are as tall as the tallest; the price row is pinned to the bottom edge.
export const OfferCard = memo(function OfferCard({ offer, onOpen }: { offer: Offer; onOpen: (id: string) => void }) {
  const { pick, t, money } = useLang()
  const [a, b] = offer.items.map((id) => getItem(id)!)
  const savings = offerSavings(offer)
  return (
    <button
      type="button"
      onClick={() => onOpen(offer.id)}
      className="group flex h-full w-full flex-col gap-2 rounded-lg border border-arctic bg-white p-2 text-start transition-[transform,background-color] duration-150 ease-out active:scale-[0.98] active:bg-mist"
    >
      <span className="relative flex aspect-[2/1] w-full gap-1">
        <Img category={a.categoryId} className="flex-1 rounded-md" />
        <Img category={b.categoryId} className="flex-1 rounded-md" />
        <span aria-hidden="true" className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow text-navy">
          <Icon name="plus" size={16} />
        </span>
        {savings > 0 && (
          <span className="absolute end-2 top-2">
            <Chip kind="savings" compact outlined>{t('saveChip', { price: money(savings) })}</Chip>
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col px-2 text-small font-semibold">
        <span>{pick(a.name)}</span>
        <span>+ {pick(b.name)}</span>
      </span>
      <span className="mt-auto flex items-center gap-2 px-2 pb-2 pt-1">
        <Price value={offerBase(offer)} size="small" />
        {savings > 0 && <Price value={offerRegularBase(offer)} size="caption" struck />}
        <span className="ms-auto"><Chevron small /></span>
      </span>
    </button>
  )
})
