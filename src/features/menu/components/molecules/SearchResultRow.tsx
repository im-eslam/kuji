import type { Item } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { Hairline } from '../atoms/Hairline'
import { Img } from '../atoms/Image'
import { Price } from '../atoms/Price'

export function SearchResultRow({ item, onChoose }: { item: Item; onChoose: (id: string) => void }) {
  const { pick } = useLang()
  return (
    <div>
      <button type="button" onClick={() => onChoose(item.id)} className="flex min-h-18 w-full items-center gap-3 px-4 py-2 text-start active:bg-mist">
        <Img category={item.categoryId} className="h-12 w-12 shrink-0 rounded-md" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body font-medium">{pick(item.name)}</span>
          <span className="line-clamp-1 text-caption font-medium text-navy-65">{pick(item.desc)}</span>
        </span>
        <Price value={item.price} size="small" />
      </button>
      <Hairline />
    </div>
  )
}
