import type { Offer } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { getItem } from '../../lib/catalog'
import { offerBase } from '../../lib/pricing'
import { Hairline } from '../atoms/Hairline'
import { Img } from '../atoms/Image'
import { Price } from '../atoms/Price'

export function SearchResultOfferRow({ offer, onChoose }: { offer: Offer; onChoose: (id: string) => void }) {
  const { pick } = useLang()
  const [a, b] = offer.items.map((id) => getItem(id)!)
  return (
    <div>
      <button type="button" onClick={() => onChoose(offer.id)} className="flex min-h-18 w-full items-center gap-3 px-4 py-2 text-start active:bg-mist">
        <span className="flex shrink-0 gap-1">
          <Img category={a.categoryId} className="h-8 w-8 rounded-md" />
          <Img category={b.categoryId} className="h-8 w-8 rounded-md" />
        </span>
        <span className="min-w-0 flex-1 text-body font-medium">{pick(a.name)} + {pick(b.name)}</span>
        <Price value={offerBase(offer)} size="small" />
      </button>
      <Hairline />
    </div>
  )
}
